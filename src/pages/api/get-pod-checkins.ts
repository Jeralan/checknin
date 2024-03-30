// get-pod-checkins.ts
import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const pod = req.body.pod;
    try {
      const client = await clientPromise;
      const collection = client.db("checkins").collection("users");

      const checkins = await collection
        .find({ pod: pod })
        .toArray();
      
      checkins.sort((a, b) => {
        const dateA = new Date(a.timeStamp).getTime();
        const dateB = new Date(b.timeStamp).getTime();
        return dateB - dateA;
      })

      res.status(200).json({ success: true, checkins });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
};
