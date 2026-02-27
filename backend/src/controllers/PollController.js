"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPollResults = exports.submitVote = exports.getActivePoll = exports.createPoll = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const PollService_1 = require("../services/PollService");
exports.createPoll = (0, express_async_handler_1.default)(async (req, res) => {
    const { question, options, duration, createdBy } = req.body;
    const poll = await PollService_1.PollService.createPoll(question, options, duration, createdBy);
    res.status(201).json({
        status: 'success',
        data: { poll }
    });
});
exports.getActivePoll = (0, express_async_handler_1.default)(async (req, res) => {
    const poll = await PollService_1.PollService.getActivePoll();
    if (!poll) {
        res.status(404).json({
            status: 'fail',
            message: 'No active poll found'
        });
        return;
    }
    res.status(200).json({
        status: 'success',
        data: { poll }
    });
});
exports.submitVote = (0, express_async_handler_1.default)(async (req, res) => {
    const pollId = req.params.pollId;
    const { studentId, studentName, selectedOption } = req.body;
    const updatedPoll = await PollService_1.PollService.castVote(pollId, studentId, studentName, selectedOption);
    res.status(200).json({
        status: 'success',
        data: { poll: updatedPoll }
    });
});
exports.getPollResults = (0, express_async_handler_1.default)(async (req, res) => {
    const pollId = req.params.pollId;
    const results = await PollService_1.PollService.calculateResults(pollId);
    res.status(200).json({
        status: 'success',
        data: { results }
    });
});
//# sourceMappingURL=PollController.js.map