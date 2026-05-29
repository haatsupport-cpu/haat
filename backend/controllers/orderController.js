import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";
import PromoCode from "../models/PromoCode.js";
import { validatePromoCode, calculatePromoDiscount } from "../utils/promoValidator.js";
import { generateOrderNumber } from "../utils/orderGenerator.js";
import { normalizeDeliveryType, validateDeliveryMinimum } from "../utils/pricingCalculator.js";

const parseNumeric = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const buildLineItems = async (items, session) => {
  const converted = [];

  for (const item of items) {
    const productId = item.productId ?? item.product_id ?? item.id;
    const quantity = Number(item.quantity ?? item.qty ?? 1);

    if (!productId || !Number.isFinite(quantity) || quantity <= 0) {
      throw new Error("Invalid order item format");
    }

    const product = await Product.findById(productId).session(session);
    if (!product || !product.isActive) {
      const err = new Error("Product not found or unavailable");
      err.statusCode = 404;
      throw err;
    }

    if (product.stock < quantity) {
      const err = new Error(`Not enough stock for ${product.name}`);
      err.statusCode = 400;
      throw err;
    }

    converted.push({
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

  return converted;
};

export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const userId = req.user.id;
    const { items, totalAmount } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }

    const subtotalCandidate =
      totalAmount && typeof totalAmount === "object"
        ? totalAmount?.subtotal ?? totalAmount?.sub_total ?? req.body.subtotal
        : req.body.subtotal ?? totalAmount;
    const subtotal = parseNumeric(subtotalCandidate ?? 0);
    const normalizedDeliveryType = normalizeDeliveryType(req.body.deliveryType ?? "instant");
    const deliveryMinimum = validateDeliveryMinimum(normalizedDeliveryType, subtotal);
    if (!deliveryMinimum.valid) {
      return res.status(400).json({ message: deliveryMinimum.error });
    }
    const tax = parseNumeric(
      totalAmount && typeof totalAmount === "object"
        ? totalAmount?.tax ?? req.body.tax
        : req.body.tax
    );
    const shipping = parseNumeric(
      totalAmount && typeof totalAmount === "object"
        ? totalAmount?.shipping ?? req.body.shipping
        : req.body.shipping
    );
    const totalCandidate =
      totalAmount && typeof totalAmount === "object"
        ? totalAmount?.total_amount ?? totalAmount?.totalAmount
        : req.body.totalAmount ?? totalAmount;
    const total = parseNumeric(totalCandidate ?? subtotal + tax + shipping);

    session.startTransaction();
    const lineItems = await buildLineItems(items, session);
    const calculatedSubtotal = lineItems.reduce((sum, item) => sum + item.total, 0);

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
          throw new Error(validation.error);
        }
        const discount = calculatePromoDiscount(promo, calculatedSubtotal);
        if (discount.error) {
          throw new Error(discount.error);
        }
        promoDiscount = discount.discountAmount;
        promoCodeId = promo._id;
      } catch (err) {
        throw { statusCode: 400, message: err.message };
      }
    }

    const calculatedTotal = Number.isFinite(total)
      ? total
      : calculatedSubtotal + parseNumeric(req.body.deliveryFee) + parseNumeric(req.body.codFee) - promoDiscount;

    const order = await Order.create(
      [
        {
          userId,
          customerName: req.body.customerName ?? req.user.name,
          customerPhone: req.body.customerPhone ?? "",
          deliveryAddress: req.body.deliveryAddress ?? "",
          landmark: req.body.landmark ?? "",
          deliveryType: normalizedDeliveryType,
          scheduledDeliveryAt: req.body.scheduledDeliveryAt ? new Date(req.body.scheduledDeliveryAt) : null,
          paymentMode: req.body.paymentMode ?? "unknown",
          promoCodeId,
          promoDiscount,
          deliveryFee: parseNumeric(req.body.deliveryFee ?? 0),
          codFee: parseNumeric(req.body.codFee ?? 0),
          subtotal: calculatedSubtotal,
          totalAmount: calculatedTotal,
          status: "pending",
          orderNumber: generateOrderNumber(),
          items: lineItems,
        },
      ],
      { session }
    );

    for (const item of lineItems) {
      await Product.updateOne(
        { _id: item.productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { session }
      );
    }

    if (promoCodeId) {
      await PromoCode.updateOne(
        { _id: promoCodeId },
        { $inc: { uses: 1 } },
        { session }
      );
    }

    const activeCart = await Cart.findOne({ user: userId, isActive: true }).session(session);
    if (activeCart) {
      activeCart.items = [];
      await activeCart.save({ session });
    }

    await session.commitTransaction();
    const createdOrder = order[0];
    return res.status(201).json({
      message: "Order placed successfully",
      orderId: createdOrder._id.toString(),
      orderNumber: createdOrder.orderNumber,
    });
  } catch (err) {
    await session.abortTransaction();
    return res.status(err.statusCode || 500).json({ message: "Failed to place order", details: err.message });
  } finally {
    session.endSession();
  }
};

export const getOrders = async (req, res) => {
  try {
    const query = req.user.role === "admin" ? {} : { userId: req.user.id }
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return res.json(
      orders.map((order) => ({
        id: order._id.toString(),
        _id: order._id.toString(),
        userId: order.userId.toString(),
        user_id: order.userId.toString(),
        orderNumber: order.orderNumber || `ORD-${order._id.toString().slice(-8)}`,
        status: order.status,
        paymentStatus: order.paymentStatus || "pending",
        payment: order.paymentStatus || "pending",
        customerName: order.customerName || "Guest",
        customer_name: order.customerName || "Guest",
        customerPhone: order.customerPhone,
        customer_phone: order.customerPhone,
        totalAmount: order.totalAmount,
        total_amount: order.totalAmount,
        subtotal: order.subtotal,
        tax: order.tax,
        shipping: order.shipping,
        deliveryAddress: order.deliveryAddress,
        delivery_address: order.deliveryAddress,
        landmark: order.landmark,
        deliveryType: order.deliveryType,
        delivery_type: order.deliveryType,
        createdAt: order.createdAt,
        created_at: order.createdAt,
        updatedAt: order.updatedAt,
        updated_at: order.updatedAt,
        placedAt: order.createdAt,
        placed_at: order.createdAt,
        items: order.items || [],
      }))
    );
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch orders", details: err.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    const updateData = {};
    
    if (status) {
      updateData.status = status;
    }
    
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }

    if (!status && !paymentStatus) {
      return res.status(400).json({ message: "Either order status or payment status is required" });
    }

    const order = await Order.findByIdAndUpdate(id, updateData, { new: true });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const message = status && paymentStatus 
      ? "Order and payment status updated successfully"
      : status 
      ? "Order status updated successfully"
      : "Payment status updated successfully";

    return res.json({ message });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update order status", details: err.message });
  }
};
