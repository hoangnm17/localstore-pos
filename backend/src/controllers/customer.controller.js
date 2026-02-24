const customerService = require('../services/customer.service');

exports.getCustomers = async (req, res) => {
    try {
        const {
            search = '',
            status,
            page = 1,
            limit = 10
        } = req.query;

        const pageNumber = Math.max(parseInt(page), 1);
        const pageSize = Math.max(parseInt(limit), 1);
        const offset = (pageNumber - 1) * pageSize;

        const result = await customerService.getCustomerList({
            search,
            status,
            limit: pageSize,
            offset
        });

        res.json({
            success: true,
            page: pageNumber,
            limit: pageSize,
            ...result
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.getCustomerById = async (req, res) => {
    try {
        const customer = await customerService.getCustomerById(req.params.id);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }
        res.json({ success: true, data: customer });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.createCustomer = async (req, res) => {
    try {
        const customer = await customerService.createCustomer(req.body);
        res.status(201).json({ success: true, data: customer });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateCustomer = async (req, res) => {
    try {
        const customer = await customerService.updateCustomer(req.params.id, req.body);
        res.json({ success: true, data: customer });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteCustomer = async (req, res) => {
    try {
        await customerService.deleteCustomer(req.params.id);
        res.json({ success: true, message: 'Customer deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getCustomerByPhone = async (req, res) => {
    try {
        const { phone } = req.query;

        const customer = await customerService.getCustomerByPhone(phone);
        
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: customer,
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};