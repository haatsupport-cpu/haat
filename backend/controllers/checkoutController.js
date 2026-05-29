import mongoose from "mongoose";
import { calculateDeliveryFee, calculateCODFee, calculateTotal, validateDeliveryDateTime, getDeliveryConfig, normalizeDeliveryType, validateDeliveryMinimum } from "../utils/pricingCalculator.js";
import { calculatePromoDiscount, formatPromoDetails, validatePromoCode } from "../utils/promoValidator.js";
import { generateOrderNumber } from "../utils/orderGenerator.js";
import PromoCode from "../models/PromoCode.js";
import PopupAd from "../models/PopupAd.js";
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
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const validatePromo = async (req, res) => {
  try {
    const { promoCode, subtotal, deliveryType } = req.body;

    if (!promoCode || typeof promoCode !== "string") {
      console.log("PROMO 400", { reason: "Promo code is required", body: req.body });
      return res.status(400).json({ message: "Promo code is required" });
    }

    const promo = await PromoCode.findOne({
      code: promoCode.trim().toUpperCase(),
      isActive: true,
    }).lean();

    if (!promo) {
      console.log("PROMO 400", { reason: "Promo code is not valid", body: req.body });
      return res.status(400).json({ message: "Promo code is not valid" });
    }

    try {
      const validation = validatePromoCode(promo, deliveryType);
      if (!validation.valid) {
        console.log("PROMO 400", { reason: validation.error, body: req.body });
        return res.status(400).json({ message: validation.error });
      }
    } catch (err) {
      console.log("PROMO 400", { reason: err.message, body: req.body });
      return res.status(400).json({ message: err.message });
    }

    const discount = calculatePromoDiscount(promo, Number(subtotal ?? 0));
    if (discount.error) {
      console.log("PROMO 400", { reason: discount.error, body: req.body });
      return res.status(400).json({ message: discount.error });
    }

    const finalAmount = Math.max(0, Number(subtotal ?? 0) - discount.discountAmount);

    return res.json({
      valid: true,
      promoCode: promo.code,
      discountType: promo.discountType ?? "percentage",
      discount: discount.discountAmount,
      finalAmount,
      // For backward compatibility:
      promoId: promo._id.toString(),
      code: promo.code,
      discountAmount: discount.discountAmount,
      description: promo.description,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getMyPromos = async (req, res) => {
  try {
    const userId = req.user.id;
    const [promos, usedOrders] = await Promise.all([
      PromoCode.find({
        $or: [{ assignedTo: { $exists: false } }, { assignedTo: { $size: 0 } }, { assignedTo: userId }],
      })
        .sort({ isActive: -1, expiresAt: 1, createdAt: -1 })
        .lean(),
      Order.find({ userId, promoCodeId: { $ne: null } }).select("promoCodeId").lean(),
    ]);

    const usedPromoIds = new Set(usedOrders.map((order) => order.promoCodeId?.toString()).filter(Boolean));
    const now = new Date();

    return res.json({
      promos: promos.map((promo) => {
        const formatted = formatPromoDetails(promo);
        const expired = promo.expiresAt ? new Date(promo.expiresAt) < now : false;
        const used = usedPromoIds.has(promo._id.toString());
        return {
          ...formatted,
          status: used ? "Used" : expired ? "Expired" : promo.isActive ? "Active" : "Expired",
        };
      }),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getActivePopupAd = async (req, res) => {
  try {
    const popup = await PopupAd.findOne({ isActive: true }).sort({ updatedAt: -1 }).lean();
    if (!popup) return res.json({ popup: null });
    return res.json({
      popup: {
        id: popup._id.toString(),
        title: popup.title || "",
        description: popup.description || popup.textContent || "",
        textContent: popup.textContent || popup.description || "",
        image: popup.image || popup.imageUrl || "",
        imageUrl: popup.imageUrl || popup.image || "",
        targetLink: popup.targetLink || "",
        updatedAt: popup.updatedAt,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const calculateOrderTotal = async (req, res) => {
  try {
    const { subtotal, deliveryType, deliveryDateTime, paymentMode, promoCode } = req.body;

    if (subtotal === undefined || !deliveryType || !paymentMode) {
      console.log("CHECKOUT 400", { reason: "subtotal, deliveryType, and paymentMode are required", body: req.body });
      return res.status(400).json({ message: "subtotal, deliveryType, and paymentMode are required" });
    }

    const normalizedDeliveryType = normalizeDeliveryType(deliveryType);
    const minimumValidation = validateDeliveryMinimum(normalizedDeliveryType, Number(subtotal));
    if (!minimumValidation.valid) {
      console.log("CHECKOUT 400", { reason: minimumValidation.error, body: req.body });
      return res.status(400).json({ message: minimumValidation.error });
    }

    const orderCount = req.user?.id ? await Order.countDocuments({ userId: req.user.id }) : 1;
    const isFirstOrder = orderCount === 0;
    const deliveryFee = calculateDeliveryFee(normalizedDeliveryType, deliveryDateTime ? new Date(deliveryDateTime) : null, {
      subtotal: Number(subtotal),
      isFirstOrder,
    });
    const codFee = calculateCODFee(paymentMode);
    let promoDiscount = 0;
    let promoId = null;

    if (promoCode) {
      const promo = await PromoCode.findOne({ code: promoCode.trim().toUpperCase(), isActive: true }).lean();
      if (promo) {
        try {
          const validation = validatePromoCode(promo, normalizedDeliveryType);
          if (validation.valid) {
            const discount = calculatePromoDiscount(promo, Number(subtotal));
            if (!discount.error) {
              promoDiscount = discount.discountAmount;
              promoId = promo._id.toString();
            }
          }
        } catch (err) {
          // Promo invalid for this delivery type, discount remains 0
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
      isFirstOrder,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const saveDeliveryAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, phoneno, address, landmark, deliveryType, scheduledDeliveryAt, isDefault } = req.body;

    if (!fullName || !phoneno || !address || !landmark) {
      console.log("ADDRESS 400", { reason: "Missing required fields", body: req.body });
      return res.status(400).json({ message: "fullName, phoneno, address, and landmark are required" });
    }

    if (!/^\d{10}$/.test(phoneno.replace(/\D/g, ""))) {
      console.log("ADDRESS 400", { reason: "Invalid phoneno number format", body: req.body });
      return res.status(400).json({ message: "Invalid phoneno number format" });
    }

    if (deliveryType === "scheduled" && scheduledDeliveryAt) {
      const validation = validateDeliveryDateTime(scheduledDeliveryAt);
      if (!validation.valid) {
        console.log("ADDRESS 400", { reason: validation.error, body: req.body });
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
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
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
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
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
    // TEMP DEBUG LOGS
    console.log("CHECKOUT PAYLOAD", req.body);

    // Normalize address (backward compatible)
    const address = String(
      req.body.address ??
      req.body.deliveryAddress ??
      req.body.location?.address ??
      ""
    ).trim();

    // Normalize coordinates (backward compatible)
    const parsedLat = Number(req.body.lat ?? req.body.location?.lat);
    const parsedLng = Number(req.body.lng ?? req.body.location?.lng);

    // Validate coordinates are finite and in range
    const validLat = Number.isFinite(parsedLat) && parsedLat >= -90 && parsedLat <= 90;
    const validLng = Number.isFinite(parsedLng) && parsedLng >= -180 && parsedLng <= 180;
    if (!validLat || !validLng) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery coordinates",
      });
    }
    // Round coordinates
    const rLat = Number(parsedLat.toFixed(6));
    const rLng = Number(parsedLng.toFixed(6));

    // Clean fields
    const clean = (v) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim() : "");
    const cleanAddress = clean(address);
    const cleanLandmark = clean(req.body.landmark);
    const cleanLabel = clean(req.body.label || "Home");

    // TEMP DEBUG LOGS
    console.log("NORMALIZED LOCATION", { rLat, rLng, address: cleanAddress });

    // Validate required fields after normalization
    const items = req.body.items;
    const customerName = req.body.customerName;
    const customerPhone = req.body.customerPhone;
    const deliveryType = req.body.deliveryType;
    const paymentMode = req.body.paymentMode;
    const scheduledDeliveryAt = req.body.scheduledDeliveryAt;
    const totalAmount = req.body.totalAmount;

    if (
      !items ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !customerName ||
      !customerPhone ||
      !cleanAddress ||
      !deliveryType ||
      !paymentMode ||
      totalAmount === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required checkout fields",
      });
    }

    // Normalize delivery type
    const normalizedDeliveryType = normalizeDeliveryType(deliveryType);

    // Start transaction
    session.startTransaction();

    // Build order items
    const orderItems = await buildCheckoutItems(items, session);
    const authoritativeSubtotal = Number(orderItems.reduce((sum, item) => sum + item.total, 0).toFixed(2));
    const authoritativeCodFee = calculateCODFee(paymentMode);
    const authoritativeDeliveryFee = calculateDeliveryFee(
      normalizedDeliveryType,
      scheduledDeliveryAt ? new Date(scheduledDeliveryAt) : null,
      {
        subtotal: authoritativeSubtotal,
        isFirstOrder: false,
      }
    );

    let promoDiscount = 0;
    let promoCodeId = null;

    const promoIdSearch = req.body.promoCodeId || req.body.promoId;
    const promoCodeSearch = req.body.promoCode;

    let promo = null;
    if (promoIdSearch && mongoose.Types.ObjectId.isValid(promoIdSearch)) {
      promo = await PromoCode.findById(promoIdSearch).session(session);
    } else if (promoCodeSearch) {
      promo = await PromoCode.findOne({ code: String(promoCodeSearch).trim().toUpperCase(), isActive: true }).session(session);
    }

    if (promo) {
      try {
        const validation = validatePromoCode(promo, normalizedDeliveryType);
        if (!validation.valid) {
          return res.status(400).json({ success: false, message: validation.error });
        }
        const discount = calculatePromoDiscount(promo, authoritativeSubtotal);
        if (discount.error) {
          return res.status(400).json({ success: false, message: discount.error });
        }
        promoDiscount = discount.discountAmount;
        promoCodeId = promo._id;
      } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
    }

    const finalTotal = calculateTotal({
      subtotal: authoritativeSubtotal,
      deliveryFee: authoritativeDeliveryFee,
      codFee: authoritativeCodFee,
      promoDiscount,
    });

    // Update product stock
    for (const item of orderItems) {
      await Product.updateOne(
        {
          _id: item.productId,
          stock: { $gte: item.quantity },
        },
        {
          $inc: { stock: -item.quantity },
        },
        { session }
      );
    }

    // Create order
    const order = await Order.create(
      [
        {
          userId: req.user.id,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          location: {
            lat: rLat,
            lng: rLng,
            address: cleanAddress,
            label: cleanLabel,
            landmark: cleanLandmark,
            coordinates: [rLng, rLat],
          },
          deliveryAddress:
            `Lat:${rLat},Lng:${rLng}` +
            `|Label:${cleanLabel || "Home"}` +
            `|Address:${cleanAddress}` +
            `|Landmark:${cleanLandmark}`,
          landmark: cleanLandmark,
          deliveryType: normalizedDeliveryType,
          scheduledDeliveryAt: scheduledDeliveryAt ? new Date(scheduledDeliveryAt) : null,
          paymentMode,
          subtotal: authoritativeSubtotal,
          deliveryFee: authoritativeDeliveryFee,
          codFee: authoritativeCodFee,
          promoCodeId,
          promoDiscount,
          totalAmount: finalTotal,
          orderNumber: generateOrderNumber(),
          items: orderItems,
        },
      ],
      { session }
    );

    if (promoCodeId) {
      await PromoCode.updateOne(
        { _id: promoCodeId },
        { $inc: { uses: 1 } },
        { session }
      );
    }

    // Clear active cart
    const activeCart = await Cart.findOne({
      user: req.user.id,
      isActive: true,
    }).session(session);
    if (activeCart) {
      activeCart.items = [];
      await activeCart.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId: order[0]._id.toString(),
      orderNumber: order[0].orderNumber,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("CHECKOUT ERROR", err);
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Failed to create order",
    });
  }
};
