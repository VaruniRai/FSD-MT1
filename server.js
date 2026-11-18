const express = require("express");

const app = express();
const PORT = 3000;

// Middleware to read JSON request bodies
app.use(express.json());

// In-memory array containing initial leave records
let leaves = [
    {
        id: 701,
        employeeName: "Ananya Singh",
        employeeCode: "EMP101",
        leaveType: "Casual",
        days: 2,
        status: "Pending"
    },
    {
        id: 702,
        employeeName: "Rahul Verma",
        employeeCode: "EMP102",
        leaveType: "Sick",
        days: 1,
        status: "Approved"
    },
    {
        id: 703,
        employeeName: "Simran Kaur",
        employeeCode: "EMP103",
        leaveType: "Earned",
        days: 3,
        status: "Rejected"
    }
];

// Allowed values
const validLeaveTypes = ["Casual", "Sick", "Earned"];
const validStatuses = ["Pending", "Approved", "Rejected"];

// Validation function
function validateLeave(data) {
    const {
        employeeName,
        employeeCode,
        leaveType,
        days,
        status
    } = data;

    if (
        typeof employeeName !== "string" ||
        employeeName.trim() === "" ||
        typeof employeeCode !== "string" ||
        employeeCode.trim() === "" ||
        !validLeaveTypes.includes(leaveType) ||
        !Number.isInteger(days) ||
        days <= 0 ||
        !validStatuses.includes(status)
    ) {
        return false;
    }

    return true;
}

// 1. GET all leave records
app.get("/api/leaves", (req, res) => {
    res.status(200).json(leaves);
});

// 2. POST a new leave record
app.post("/api/leaves", (req, res) => {
    const data = req.body;

    if (!validateLeave(data)) {
        return res.status(400).json({
            message: "Invalid input. Please provide all required fields with valid values."
        });
    }

    const newId = leaves.length > 0
        ? Math.max(...leaves.map(leave => leave.id)) + 1
        : 1;

    const newLeave = {
        id: newId,
        employeeName: data.employeeName.trim(),
        employeeCode: data.employeeCode.trim(),
        leaveType: data.leaveType,
        days: data.days,
        status: data.status
    };

    leaves.push(newLeave);

    res.status(201).json({
        message: "Leave request created successfully",
        leave: newLeave
    });
});

// 3. GET pending leave requests
// Keep this route before /:id
app.get("/api/leaves/pending", (req, res) => {
    const pendingLeaves = leaves.filter(
        leave => leave.status === "Pending"
    );

    res.status(200).json(pendingLeaves);
});

// 4. FILTER leave records by status
// Keep this route before /:id
app.get("/api/leaves/filter", (req, res) => {
    const status = req.query.status;

    if (!status) {
        return res.status(400).json({
            message: "Please provide a status query parameter"
        });
    }

    const filteredLeaves = leaves.filter(
        leave => leave.status.toLowerCase() === status.toLowerCase()
    );

    res.status(200).json(filteredLeaves);
});

// 5. GET leave request by ID
app.get("/api/leaves/:id", (req, res) => {
    const id = Number(req.params.id);

    const leave = leaves.find(leave => leave.id === id);

    if (!leave) {
        return res.status(404).json({
            message: "Leave request not found"
        });
    }

    res.status(200).json(leave);
});

// 6. PUT / UPDATE leave request
app.put("/api/leaves/:id", (req, res) => {
    const id = Number(req.params.id);

    const index = leaves.findIndex(
        leave => leave.id === id
    );

    if (index === -1) {
        return res.status(404).json({
            message: "Leave request not found"
        });
    }

    const data = req.body;

    if (!validateLeave(data)) {
        return res.status(400).json({
            message: "Invalid input. Please provide all required fields with valid values."
        });
    }

    leaves[index] = {
        id: id,
        employeeName: data.employeeName.trim(),
        employeeCode: data.employeeCode.trim(),
        leaveType: data.leaveType,
        days: data.days,
        status: data.status
    };

    res.status(200).json({
        message: "Leave request updated successfully",
        leave: leaves[index]
    });
});

// 7. DELETE leave request
app.delete("/api/leaves/:id", (req, res) => {
    const id = Number(req.params.id);

    const index = leaves.findIndex(
        leave => leave.id === id
    );

    if (index === -1) {
        return res.status(404).json({
            message: "Leave request not found"
        });
    }

    leaves.splice(index, 1);

    res.status(200).json({
        message: "Leave request deleted successfully"
    });
});

// Handle invalid routes
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found"
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});