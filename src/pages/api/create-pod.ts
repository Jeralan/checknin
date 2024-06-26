// pages/api/create-pod.ts
import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';

const savePod = async (email: string, name: string): Promise<string> => {
  try {
        const newPod = {userId: email, name: name, linkAccess: false, shared: [email]}
        const client = await clientPromise;
        const collection = client.db("checkins").collection("pods");
        const result = await collection.insertOne(newPod);
    
        // Check if the insertion was successful and return true if it was
        if (result.acknowledged) {
            const podId = (await collection.find(newPod).toArray())[0]._id.toString();
            return podId;
        } else {
            return "";
        }
      } catch (error) {
        console.error("Error inserting data into MongoDB:", error);
        return "";
      }
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const email = req.body.email;
    const name = req.body.name
    try {
      const id = await savePod(email, name);
      res.status(200).json({ success: true, id });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
};
