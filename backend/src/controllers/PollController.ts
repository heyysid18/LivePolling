import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { PollService } from '../services/PollService';

export const createPoll = asyncHandler(async (req: Request, res: Response) => {
    const { question, options, duration, createdBy, sessionId } = req.body;

    if (!sessionId) {
        res.status(400).json({ status: 'fail', message: 'sessionId is required' });
        return;
    }

    const poll = await PollService.createPoll(question, options, duration, createdBy, sessionId);

    res.status(201).json({
        status: 'success',
        data: { poll }
    });
});

export const getActivePoll = asyncHandler(async (req: Request, res: Response) => {
    const poll = await PollService.getActivePoll();

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

export const submitVote = asyncHandler(async (req: Request, res: Response) => {
    const pollId = req.params.pollId as string;
    const { studentId, studentName, selectedOption } = req.body;

    const updatedPoll = await PollService.castVote(pollId, studentId, studentName, selectedOption);

    res.status(200).json({
        status: 'success',
        data: { poll: updatedPoll }
    });
});

export const getPollResults = asyncHandler(async (req: Request, res: Response) => {
    const pollId = req.params.pollId as string;

    const results = await PollService.calculateResults(pollId);

    res.status(200).json({
        status: 'success',
        data: { results }
    });
});

export const getPollHistory = asyncHandler(async (req: Request, res: Response) => {
    const history = await PollService.getPollHistory();

    res.status(200).json({
        status: 'success',
        data: { polls: history }
    });
});

export const getSessionResults = asyncHandler(async (req: Request, res: Response) => {
    const sessionId = req.params.sessionId as string;

    const results = await PollService.getSessionResults(sessionId);

    res.status(200).json({
        status: 'success',
        data: results // returning root object cleanly
    });
});
