export interface PollOption {
    id: string;
    text: string;
    votes: number;
}

export interface Poll {
    _id: string;
    question: string;
    options: PollOption[];
    duration: number;
    status: 'active' | 'completed';
    startTime: string;
    createdBy: string;
}

export interface VoteData {
    pollId: string;
    studentId: string;
    studentName: string;
    selectedOption: string;
}
