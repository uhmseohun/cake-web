import express, { Router } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { IAuthRequest } from '../../middlewares/auth';

import roomModel, { IRoomModel } from '../../models/roomModel';
import userModel, { IUserModel } from '../../models/userModel';

const router: express.IRouter = Router();

router.post('/:roomID', expressAsyncHandler(
  async (req: IAuthRequest, res: express.Response, _: express.NextFunction) => {
    const roomID: string = req.params.roomID;
    const { id: userID }: { id: string } = req.identity;
    const { pin }: { pin: string } = req.body;

    const user: IUserModel = await userModel.findById(userID);
    const room: IRoomModel = await roomModel.findById(roomID);

    if (pin !== room.pin) {
      return res.status(400)
        .json({
          message: 'PIN을 잘못 입력하셨습니다.',
        });
    }

    if (room.max <= room.users.length) {
      return res.status(403)
        .json({
          message: '이미 꽉 찬 방입니다.'
        })
    }

    const { uid }: { uid: string } = user;
    if (!room.users.includes(uid)) {
      room.users.push(user.uid);
    }
    room.save();

    return res.json({ room });
  }),
);

export default router;
