"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PollController_1 = require("../controllers/PollController");
const validateRequest_1 = require("../middleware/validateRequest");
const poll_schema_1 = require("../schemas/poll.schema");
const router = (0, express_1.Router)();
router.post('/', (0, validateRequest_1.validate)(poll_schema_1.createPollSchema), PollController_1.createPoll);
router.get('/active', PollController_1.getActivePoll);
router.post('/:pollId/vote', (0, validateRequest_1.validate)(poll_schema_1.submitVoteSchema), PollController_1.submitVote);
router.get('/:pollId/results', PollController_1.getPollResults);
exports.default = router;
//# sourceMappingURL=poll.routes.js.map