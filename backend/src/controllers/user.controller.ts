import { Request, Response } from 'express';
export const getCurrentUser = async (req: Request, res: Response) => {
  console.log('User_Controller: getCurrentUser');
  res.status(501).json({ message: 'Not Implemented' });
};
export const updateCurrentUser = async (req: Request, res: Response) => {
  console.log('User_Controller: updateCurrentUser');
  res.status(501).json({ message: 'Not Implemented' });
};
