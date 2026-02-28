import { Router } from 'express';
import { createPoll, getActivePoll, submitVote, getPollResults, getPollHistory, getSessionResults } from '../controllers/PollController';
import { validate } from '../middleware/validateRequest';
import { createPollSchema, submitVoteSchema } from '../schemas/poll.schema';

const router = Router();

router.post('/', validate(createPollSchema), createPoll);
router.get('/active', getActivePoll);
router.get('/history', getPollHistory); // Must be before /:pollId routes so 'history' isn't parsed as an ID
router.get('/session/:sessionId/results', getSessionResults);
router.post('/:pollId/vote', validate(submitVoteSchema), submitVote);
router.get('/:pollId/results', getPollResults);

export default router;
