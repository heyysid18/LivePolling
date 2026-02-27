import { Router } from 'express';
import { createPoll, getActivePoll, submitVote, getPollResults } from '../controllers/PollController';
import { validate } from '../middleware/validateRequest';
import { createPollSchema, submitVoteSchema } from '../schemas/poll.schema';

const router = Router();

router.post('/', validate(createPollSchema), createPoll);
router.get('/active', getActivePoll);
router.post('/:pollId/vote', validate(submitVoteSchema), submitVote);
router.get('/:pollId/results', getPollResults);

export default router;
