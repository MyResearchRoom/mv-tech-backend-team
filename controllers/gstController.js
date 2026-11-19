
const axios = require("axios");

exports.fetchGSTDetails = async (req, res) => {
  try {
    const { gstin } = req.body;

    if (!gstin) {
      return res.status(400).json({
        success: false,
        message: "GSTIN is required",
      });
    }

    const normalizedGSTIN = gstin.trim().toUpperCase();


    const gstinRegex =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

    if (!gstinRegex.test(normalizedGSTIN)) {
      return res.status(400).json({
        success: false,
        message: "Invalid GSTIN format",
      });
    }

    const response = await axios.get(
      `${process.env.GSTIN_API_BASE_URL}/v1/gstin/${normalizedGSTIN}`,
      {
        headers: {
          "x-api-key": process.env.GSTIN_API_KEY,
        },
        timeout: 15000,
      }
    );

    const apiResult = response.data;

    if (!apiResult.success || !apiResult.data) {
      return res.status(404).json({
        success: false,
        message: "GST details not found",
      });
    }

    const gstData = apiResult.data;

    return res.status(200).json({
      success: true,
      message: "GST details fetched successfully",
      data: {
        gstin: gstData.gstin,
        pan: gstData.gstin.substring(2, 12),
        legalName: gstData.legal_name,
        tradeName: gstData.trade_name,
        status: gstData.status,
        taxpayerType: gstData.taxpayer_type,
        businessConstitution: gstData.business_constitution,
        registrationDate: gstData.registration_date,
        cancellationDate: gstData.cancellation_date,
        stateCode: gstData.state_code,
        address: gstData.address,
        city: gstData.city,
        pincode: gstData.pincode,
        addressDetails: gstData.address_details,
        natureOfBusiness: gstData.nature_of_business,
        blockStatus: gstData.block_status,
      },
      creditsRemaining: apiResult.credits_remaining,
    });
  } catch (error) {
    console.error(
      "GST API error:",
      error.response?.data || error.message
    );

    return res.status(error.response?.status || 500).json({
      success: false,
      message:
        error.response?.data?.message ||
        "Unable to fetch GST details. Please try again.",
    });
  }
};
