import bcrypt from 'bcrypt';
import { RoomModel, RoomShared, RoomInternal } from '../models/room.model';
import { QuestionSetInternal, QuestionSetSchema } from '../models/question.model';
import { Outgoing } from '../utils/event.constants';
import { UserSocket } from '../utils/socket.utils';

export { join, adminJoin, create, getState, adminGetState };

const saltRounds = 10;
const activeRooms: RoomInternal[] = [];

async function create(room: RoomShared, socket: UserSocket) {
  if (!room.name || !room.password) {
    return socket.emit(Outgoing.WARNING, `Błędne dane.`);
  }

  const name = room.name;
  const dbRoom = await RoomModel.findOne({ name });

  if (dbRoom) {
    return socket.emit(Outgoing.WARNING, `Pokój o nazwie ${name} już istnieje.`);
  }

  const hash = bcrypt.hashSync(room.password, saltRounds);
  await new RoomModel({ name, hash }).save();

  const newRoom = new RoomInternal(name);
  activeRooms.push(newRoom);

  socket.room = newRoom;
  socket.join(socket.room.name);
  socket.emit(Outgoing.ROOM_CREATED, {
    msg: `Pokój o nazwie ${name} został utworzony.`,
    name,
    token: newRoom.token
  });
}

function join(room: RoomShared, socket: UserSocket) {
  if (!room.name) {
    return socket.emit(Outgoing.WARNING, `Błędne dane.`);
  }

  const name = room.name;

  const activeRoom = activeRooms.find(e => e.name === name);
  if (!activeRoom) {
    return socket.emit(Outgoing.WARNING, `Podany pokój nie istnieje lub gra nie jest aktywna.`);
  }

  // TODO: normal user should not have access to token, not big deal bcs not exposed in API
  socket.room = activeRoom;
  socket.join(socket.room.name);
  socket.emit(Outgoing.ROOM_JOINED, { msg: `Dołączono do pokoju o nazwie ${name}.`, name });
}

async function adminJoin(room: RoomShared, socket: UserSocket) {
  if (!room.name || !room.password) {
    return socket.emit(Outgoing.WARNING, `Błędne dane.`);
  }

  const name = room.name;
  const dbRoom = await RoomModel.findOne({ name }).populate('questions');

  if (!dbRoom || !bcrypt.compareSync(room.password, dbRoom.hash)) {
    return socket.emit(Outgoing.UNAUTHORIZED, `Podany pokój nie istnieje lub hasło jest nieprawidłowe.`);
  }

  let activeRoom = activeRooms.find(e => e.name === name);
  if (!activeRoom) {
    const questions = dbRoom.questions as QuestionSetSchema;
    activeRoom = new RoomInternal(name).withQuestions(new QuestionSetInternal(questions.name, questions.categories));
    activeRooms.push(activeRoom);
  }

  socket.room = activeRoom;
  socket.join(socket.room.name);
  socket.emit(Outgoing.ROOM_JOINED, { msg: `Dołączono do pokoju o nazwie ${name}.`, name, token: activeRoom.token });
}

function getState(room: RoomShared, socket: UserSocket) {
  socket.emit(Outgoing.STATE);
}

function adminGetState(room: RoomShared, socket: UserSocket) {
  if (!room.token || !room.name) {
    return socket.emit(Outgoing.UNAUTHORIZED, `Brak uprawnień.`);
  }

  const name = room.name;
  const foundRoom = activeRooms.find(e => e.name === name);

  if (foundRoom == null) {
    return socket.emit(Outgoing.WARNING, `Pokój nie jest już aktywny.`);
  }
  if (foundRoom.token !== room.token) {
    return socket.emit(Outgoing.UNAUTHORIZED, `Brak uprawnień.`);
  }

  socket.room = foundRoom;
  socket.join(socket.room.name);
  socket.emit(Outgoing.STATE);
}