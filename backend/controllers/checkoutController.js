import mongoose from "mongoose";
import { calculateDeliveryFee, calculateCODFee, calculateTotal, validateDeliveryDateTime, getDeliveryConfig } from "../utils/pricingCalculator.js";
import { calculatePromoDiscount, validatePromoCode } from "../utils/promoValidator.js";
import { generateOrderNumber } from "../utils/orderGenerator.js";
import PromoCode from "../models/PromoCode.js";
import DeliveryAddress from "../models/DeliveryAddress.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";
import CONFIG from "../config/constants.js";

export const getPricingConfig = async (req, res) => {
  try {
    const config = getDeliveryConfig();
    return res.json(config);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch pricing config", details: err.message });
  }
};

export const validatePromo = async (req, res) => {
  try {
    const { promoCode, subtotal } = req.body;

    if (!promoCode || typeof promoCode !== "string") {
      return res.status(400).json({ message: "Promo code is required" });
    }

    const promo = await PromoCode.findOne({
      code: promoCode.trim().toUpperCase(),
      isActive: true,
    }).lean();

    if (!promo) {
      return res.status(400).json({ message: "Promo code is not valid" });
    }

    const validation = validatePromoCode(promo);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.error });
    }

    const discount = calculatePromoDiscount(promo, Number(subtotal ?? 0));
    if (discount.error) {
      return res.status(400).json({ message: discount.error });
    }

    return res.json({
      valid: true,
      promoId: promo._id.toString(),
      code: promo.code,
      discountAmount: discount.discountAmount,
      description: promo.description,
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to validate promo code", details: err.message });
  }
};

export const calculateOrderTotal = async (req, res) => {
  try {
    const { subtotal, deliveryType, deliveryDateTime, paymentMode, promoCode } = req.body;

    if (subtotal === undefined || !deliveryType || !paymentMode) {
      return res.status(400).json({ message: "subtotal, deliveryType, and paymentMode are required" });
    }

    const deliveryFee = calculateDeliveryFee(deliveryType, deliveryDateTime ? new Date(deliveryDateTime) : null);
    const codFee = calculateCODFee(paymentMode);
    let promoDiscount = 0;
    let promoId = null;

    if (promoCode) {
      const promo = await PromoCode.findOne({ code: promoCode.trim().toUpperCase(), isActive: true }).lean();
      if (promo) {
        const validation = validatePromoCode(promo);
        if (validation.valid) {
          const discount = calculatePromoDiscount(promo, Number(subtotal));
          if (!discount.error) {
            promoDiscount = discount.discountAmount;
            promoId = promo._id.toString();
          }
        }
      }
    }

    const totalAmount = calculateTotal({
      subtotal: Number(subtotal),
      deliveryFee,
      codFee,
      promoDiscount,
    });

    return res.json({
      subtotal: Number(subtotal),
      deliveryFee,
      codFee,
      promoDiscount,
      totalAmount,
      promoId,
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to calculate total", details: err.message });
  }
};

export const saveDeliveryAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, phoneno, address, landmark, deliveryType, scheduledDeliveryAt, isDefault } = req.body;

    if (!fullName || !phoneno || !address || !landmark) {
      return res.status(400).json({ message: "fullName, phoneno, address, and landmark are required" });
    }

    if (!/^\d{10}$/.test(phoneno.replace(/\D/g, ""))) {
      return res.status(400).json({ message: "Invalid phoneno number format" });
    }

    if (deliveryType === "scheduled" && scheduledDeliveryAt) {
      const validation = validateDeliveryDateTime(scheduledDeliveryAt);
      if (!validation.valid) {
        return res.status(400).json({ message: validation.error });
      }
    }

    if (isDefault) {
      await DeliveryAddress.updateMany({ user: userId }, { isDefault: false });
    }

    const addressDoc = await DeliveryAddress.create({
      user: userId,
      fullName: fullName.trim(),
      phoneno: phoneno.trim(),
      address: address.trim(),
      landmark: landmark.trim(),
      deliveryType: deliveryType || "instant",
      scheduledDeliveryAt: scheduledDeliveryAt ? new Date(scheduledDeliveryAt) : null,
      isDefault: Boolean(isDefault),
    });

    return res.status(201).json({
      id: addressDoc._id.toString(),
      fullName: addressDoc.fullName,
      phoneno: addressDoc.phoneno,
      address: addressDoc.address,
      landmark: addressDoc.landmark,
      deliveryType: addressDoc.deliveryType,
      scheduledDeliveryAt: addressDoc.scheduledDeliveryAt,
      isDefault: addressDoc.isDefault,
      createdAt: addressDoc.createdAt,
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to save delivery address", details: err.message });
  }
};

export const getUserDeliveryAddresses = async (req, res) => {
  try {
    const userId = req.user.id;
    const addresses = await DeliveryAddress.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 }).lean();
    return res.json(addresses.map((address) => ({
      id: address._id.toString(),
      fullName: address.fullName,
      phoneno: address.phoneno,
      address: address.address,
      landmark: address.landmark,
      deliveryType: address.deliveryType,
      scheduledDeliveryAt: address.scheduledDeliveryAt,
      isDefault: address.isDefault,
      createdAt: address.createdAt,
    })));
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch delivery addresses", details: err.message });
  }
};

const buildCheckoutItems = async (items, session) => {
  const builtItems = [];

  for (const item of items) {
    const productId = item.productId ?? item.product_id ?? item.id;
    const quantity = Number(item.quantity ?? item.qty ?? 1);
    if (!productId || !Number.isFinite(quantity) || quantity <= 0) {
      const error = new Error("Invalid checkout item format");
      error.statusCode = 400;
      throw error;
    }

    const product = await Product.findById(productId).session(session);
    if (!product || !product.isActive) {
      const error = new Error("Product not found or unavailable");
      error.statusCode = 404;
      throw error;
    }

    if (product.stock < quantity) {
      const error = new Error(`Not enough stock for ${product.name}`);
      error.statusCode = 400;
      throw error;
    }

    builtItems.push({
      productId: product._id,
      name: product.name,
      quantity,
      unitPrice: product.price,
      total: product.price * quantity,
      imageUrl: product.imageUrl ?? "",
      category: product.category?.toString() ?? "",
      vendorId: product.vendor?.toString() ?? null,
    });
  }

  return builtItems;
};

export const createCheckoutOrder = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const userId = req.user.id;
    const {
      items,
      customerName,
      customerPhone,
      // location fields
      lat,
      lng,
      address,
      landmark,
      label,
      deliveryType,
      scheduledDeliveryAt,
      paymentMode,
      promoCodeId,
      promoDiscount,
      deliveryFee,
      codFee,
      subtotal,
      totalAmount,
    } = req.body;

    if (
      !items ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !customerName ||
      !customerPhone ||
      address === undefined ||
      landmark === undefined ||
      lat === undefined ||
      lng === undefined ||
      !deliveryType ||
      !paymentMode ||
      totalAmount === undefined
    ) {
      return res.status(400).json({ message: "Missing required checkout fields" });
    }

    if (!/^\d{10}$/.test(customerPhone.replace(/\D/g, ""))) {
      return res.status(400).json({ message: "Invalid phoneno number format" });
    }

    if (deliveryType === "scheduled" && scheduledDeliveryAt) {
      const validation = validateDeliveryDateTime(scheduledDeliveryAt);
      if (!validation.valid) {
        return res.status(400).json({ message: validation.error });
      }
    }

    // Validate coordinates
    const parsedLat = Number(lat);
    const parsedLng = Number(lng);
    if (!Number.isFinite(parsedLat) || !Number.isFinite(parsedLng) || parsedLat < -90 || parsedLat > 90 || parsedLng < -180 || parsedLng > 180) {
      return res.status(400).json({ message: "Invalid coordinates" });
    }

    // Round coords to 6 decimals
    const rLat = Number(parsedLat.toFixed(6));
    const rLng = Number(parsedLng.toFixed(6));

    // Clean/trim text fields
    const clean = (v) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim() : "");
    const cleanAddress = clean(address);
    const cleanLandmark = clean(landmark);
    const cleanLabel = clean(label || "");

    if (!cleanAddress) return res.status(400).json({ message: "Empty address" });

    // Haversine distance (km)
    const haversineKm = (lat1, lon1, lat2, lon2) => {
      const toRad = (d) => (d * Math.PI) / 180;
      const R = 6371;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
      return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    };

    // Shop origin - replace placeholders with real coords via env or code
    const SHOP_LAT = CONFIG.SHOP_LAT;
    const SHOP_LNG = CONFIG.SHOP_LNG;

    const distanceKm = haversineKm(SHOP_LAT, SHOP_LNG, rLat, rLng);

    // Surcharge logic
    const baseRadius = 15; // km
    const excessKm = distanceKm > baseRadius ? Math.max(0, distanceKm - baseRadius) : 0;
    const surcharge = excessKm > 0 ? Number((excessKm * 25).toFixed(2)) : 0; // Rs per km

    // Merge surcharge into deliveryFee and total if schema lacks deliveryCharge field
    const mergedDeliveryFee = Number((Number(deliveryFee ?? 0) + surcharge).toFixed(2));
    const mergedTotal = Number((Number(totalAmount ?? 0) + surcharge).toFixed(2));

    // Format storage string for deliveryAddress per requirement
    const storedLocation = `Lat:${rLat},Lng:${rLng}|Label:${cleanLabel || "Home"}|Address:${cleanAddress}|Landmark:${cleanLandmark}`;

    let finalPromoCodeId = null;
    let validatedPromo = null;
    if (promoCodeId) {
      validatedPromo = await PromoCode.findOne({ _id: promoCodeId, isActive: true }).lean();
      if (!validatedPromo) {
        return res.status(400).json({ message: "Invalid promo code" });
      }
      const validation = validatePromoCode(validatedPromo);
      if (!validation.valid) {
        return res.status(400).json({ message: validation.error });
      }
      finalPromoCodeId = validatedPromo._id;
    }

    session.startTransaction();
    const orderItems = await buildCheckoutItems(items, session);

    for (const item of orderItems) {
      await Product.updateOne(
        { _id: item.productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { session }
      );
    }

    const order = await Order.create(
      [
        {
          userId,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          deliveryAddress: storedLocation,
          landmark: cleanLandmark,
          deliveryType,
          scheduledDeliveryAt: scheduledDeliveryAt ? new Date(scheduledDeliveryAt) : null,
          paymentMode,
          promoCodeId: finalPromoCodeId,
          promoDiscount: Number(promoDiscount ?? 0),
          deliveryFee: mergedDeliveryFee,
          codFee: Number(codFee ?? 0),
          subtotal: Number(subtotal ?? orderItems.reduce((sum, item) => sum + item.total, 0)),
          totalAmount: mergedTotal,
          orderNumber: generateOrderNumber(),
          items: orderItems,
        },
      ],
      { session }
    );

    const activeCart = await Cart.findOne({ user: userId, isActive: true }).session(session);
    if (activeCart) {
      activeCart.items = [];
      await activeCart.save({ session });
    }

    if (validatedPromo) {
      await PromoCode.updateOne({ _id: validatedPromo._id }, { $inc: { uses: 1 } }, { session });
    }

    await session.commitTransaction();
    session.endSession();

    const createdOrder = order[0];
    return res.status(201).json({
      message: "Order placed successfully",
      orderId: createdOrder._id.toString(),
      orderNumber: createdOrder.orderNumber,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return res.status(err.statusCode || 500).json({ message: "Failed to create order", details: err.message });
  }
};
