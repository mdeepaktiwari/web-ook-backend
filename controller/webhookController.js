const Webhook = require("../models/webhook");
const Event = require("../models/event");
const {
  VALID_WEBHOOK_STATUS,
  WEBHOOK_SUBSCRIPTION_STATUS,
} = require("../constant");
const { io, userSocketMap } = require("../index");

exports.saveWebhook = async (req, res) => {
  try {
    const webhook = new Webhook({
      user: req.user._id,
      source: req.body.source,
      callback: req.body.callback,
    });
    await webhook.save();
    const webhookObject = webhook.toObject();
    return res.status(200).json({
      message: "Webhook saved successfully",
      webhook: {
        callback: webhookObject.callback,
        source: webhookObject.source,
        id: webhookObject._id,
      },
    });
  } catch (error) {
    console.log(`[ERROR]: Error in subscribe: ${error}`);
    return res.status(500).json({ message: "Error in saving webhook" });
  }
};

exports.userWebhooks = async (req, res) => {
  try {
    const webhooks = await Webhook.find({
      user: req.user._id,
    });
    const webhookObjects = webhooks.map((webhook) => ({
      callback: webhook.callback,
      source: webhook.source,
      id: webhook._id,
      status: webhook.status,
    }));
    return res.status(200).json({
      message: "Webhooks fetched successfully",
      webhooks: webhookObjects,
    });
  } catch (error) {
    console.log(`[ERROR]: Error in subscribedWebhooks: ${error}`);
    return res.status(500).json({ message: "Error in fetching webhook" });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status, id } = req.body;
    const webhook = await Webhook.findById(id);
    if (!VALID_WEBHOOK_STATUS.has(status))
      return res.status(400).json({ message: "Invalid status" });

    if (!webhook) return res.status(404).json({ message: "Webhook not found" });
    webhook.status = status;
    await webhook.save();
    return res.status(200).json({
      message: "Webhook unsubscribed successfully",
    });
  } catch (error) {
    console.log(`[ERROR]: Error in unsubscribe: ${error}`);
    return res.status(500).json({ message: "Error in unsubscribing webhook" });
  }
};

exports.eventHandler = async (req, res) => {
  try {
    const { webhook, data, status } = req.body;
    if (!webhook) return res.status(400).json({ message: "Invalid request" });
    const webhookObj = await Webhook.findById(webhook);
    if (!webhookObj)
      return res.status(404).json({ message: "Webhook not found" });

    if (webhookObj.status === WEBHOOK_SUBSCRIPTION_STATUS.UNSUBSCRIBED)
      return res.status(400).json({ message: "Webhook is unsubscribed" });

    const eventObj = {
      webhook: webhookObj._id,
      data,
    };
    if (status) eventObj.status = status;

    const event = new Event(eventObj);
    await event.save();

    const webhookObject = webhookObj.toObject();
    const userId = webhookObject.user;
    const socketId = userSocketMap.get(userId.toString());

    if (webhookObject.callback) {
      // send data to the callback URL
    }
    if (socketId) {
      io.to(socketId).emit("webhook-event", {
        message: "New event received",
        data: {
          event: {
            ...eventObj,
            data: {
              ...eventObj.data,
              source: webhookObject.source,
              callback: webhookObject.callback,
            },
          },
          user: userId,
        },
      });
    } else {
      console.log(`[ERROR]: No active socket connection for user ${userId}`);
    }

    return res.status(200).json({ message: "Event saved successfully" });
  } catch (error) {
    console.log(`[ERROR]: Error in eventHandler: ${error}`);
    return res.status(500).json({ message: "Error in handling event" });
  }
};
