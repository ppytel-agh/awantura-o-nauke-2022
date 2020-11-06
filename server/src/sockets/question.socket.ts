import { Server } from 'socket.io';
import { Incoming } from '../utils/event.constants';
import { UserSocket } from '../utils/socket.utils';
import { addQuestionSet, getAllQuestionSets, changeQuestionSet } from '../services/question.service';

export { listen };

function listen(io: Server, socket: UserSocket) {
  socket.on(Incoming.ADD_QUESTION_SET, questions => addQuestionSet(questions, socket));
  socket.on(Incoming.GET_ALL_QUESTION_SETS, () => getAllQuestionSets(socket));
  socket.on(Incoming.CHANGE_QUESTION_SET, questions => changeQuestionSet(questions, socket));
}