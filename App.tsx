import type { VercelRequest, VercelResponse } from '@vercel/node';
import { raynaProxy } from './_proxy';

export default (req: VercelRequest, res: VercelResponse) =>
  raynaProxy('/Tour/tourStaticDataById', req, res);
