import Contact from "../models/contactModel.js";
import validator from "validator";
import { sendContactNotificationEmail } from "../utils/emailService.js";
import jwt from "jsonwebtoken";

// Submit contact form
export const submitContact = async (req, res) => {
  try {
    console.log("🔵 [CONTACT] Contact form submission received");
    const { name, email, subject, message } = req.body;
    
    // Extract userId from token if present (optional - guest submissions allowed)
    let userId = null;
    const token = req.headers?.token;
    if (token) {
      try {
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        userId = token_decode?.id || null;
        console.log("👤 User ID from token:", userId);
      } catch (error) {
        // Invalid token - continue as guest submission
        console.log("⚠️ Invalid token, proceeding as guest submission");
      }
    }

    console.log("📦 Contact data:", { name, email, subject, hasMessage: !!message });

    // Validation
    if (!name || !name.trim()) {
      console.error("❌ Name is required");
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    if (!email || !email.trim()) {
      console.error("❌ Email is required");
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    if (!validator.isEmail(email)) {
      console.error("❌ Invalid email format:", email);
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    if (!message || !message.trim()) {
      console.error("❌ Message is required");
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    // Create contact entry
    const contactData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject?.trim() || "General Inquiry",
      message: message.trim(),
      userId: userId || null,
      status: "new",
    };

    console.log("💾 Saving contact message to database");
    const newContact = new Contact(contactData);
    await newContact.save();

    console.log("✅ Contact message saved:", newContact._id);

    // Send notification email to admin (optional - don't fail if email fails)
    try {
      await sendContactNotificationEmail(newContact);
      console.log("✅ Admin notification email sent");
    } catch (emailError) {
      console.error("❌ Error sending admin notification email:", emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: "Thank you for contacting us! We'll get back to you within 24-48 hours.",
      contactId: newContact._id,
    });
  } catch (error) {
    console.error("❌ [CONTACT] Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to submit contact form",
    });
  }
};

// Get all contact messages (admin only)
export const getAllContacts = async (req, res) => {
  try {
    console.log("🔵 [CONTACT] Get all contacts request (admin)");
    
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    if (status && ["new", "read", "replied", "archived"].includes(status)) {
      query.status = status;
    }

    const contacts = await Contact.find(query)
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Contact.countDocuments(query);

    console.log("✅ Contacts retrieved:", contacts.length);

    res.json({
      success: true,
      contacts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("❌ [CONTACT] Error getting contacts:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve contacts",
    });
  }
};

// Get single contact (admin only)
export const getContact = async (req, res) => {
  try {
    console.log("🔵 [CONTACT] Get contact request:", req.params.id);
    const contact = await Contact.findById(req.params.id).populate("userId", "name email");

    if (!contact) {
      console.error("❌ Contact not found:", req.params.id);
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
      });
    }

    console.log("✅ Contact retrieved");
    res.json({
      success: true,
      contact,
    });
  } catch (error) {
    console.error("❌ [CONTACT] Error getting contact:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve contact",
    });
  }
};

// Update contact status (admin only)
export const updateContactStatus = async (req, res) => {
  try {
    console.log("🔵 [CONTACT] Update contact status request");
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["new", "read", "replied", "archived"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Valid status is required (new, read, replied, archived)",
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("userId", "name email");

    if (!contact) {
      console.error("❌ Contact not found:", id);
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
      });
    }

    console.log("✅ Contact status updated:", status);
    res.json({
      success: true,
      message: "Contact status updated successfully",
      contact,
    });
  } catch (error) {
    console.error("❌ [CONTACT] Error updating contact status:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update contact status",
    });
  }
};

// Delete contact (admin only)
export const deleteContact = async (req, res) => {
  try {
    console.log("🔵 [CONTACT] Delete contact request:", req.params.id);
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      console.error("❌ Contact not found:", req.params.id);
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
      });
    }

    console.log("✅ Contact deleted");
    res.json({
      success: true,
      message: "Contact message deleted successfully",
    });
  } catch (error) {
    console.error("❌ [CONTACT] Error deleting contact:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete contact",
    });
  }
};
