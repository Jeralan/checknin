import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef} from 'react';
import { Pod } from '../../api/types';
import { useSession, signIn } from "next-auth/react";
import Link from 'next/link';
import Header from '../../../components/Header';
import Landing from '../../../components/Landing';
import Head from 'next/head';

const PodShare: NextPage = () => {
    const {data : session} = useSession();
    const router = useRouter();
    const { id } = router.query;
    const [pod, setPod] = useState<Pod>();
    const [textValue, setTextValue] = useState('');
    const url = `https://checknin.net/pod/${id}/view`;

    useEffect(() => {fetchPod(id?.toString() || null)}, [session, router]);

    const fetchPod = (id : string | null) => {
        if (session && id) {
          fetch('/api/get-pod', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ _id: id}),
          })
            .then((response) => response.json())
            .then((data) => {
              if (data.success) {
                setPod(data.pod);
              }
            });
        }
    }

    const handleShare = (e: React.FormEvent) => {
        e.preventDefault();
        if (pod) {
            const data = {
                title: "send me a checkin bruh",
                url: url,
                text: "send me a checkin bruh"
            }
            if (navigator.canShare(data)) {
                navigator.share(data).catch(console.error)
            }
        }
    }

    const toggleLinkAccess = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pod) {
            if (pod.linkAccess) {
                pod.linkAccess = !(pod.linkAccess)
            } else {
                pod.linkAccess = true
            }
            const response = await fetch('/api/update-access', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({collection: "pods", id, linkAccess: pod.linkAccess}),
              });
              if (!response.ok) {
                const error = await response.json();
                console.error('Error saving input:', error);
              } else {
                  fetchPod(id?.toString() || null);
              }
        }
    }

    const addUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pod) {
            const response = await fetch('/api/update-users', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({collection: "pods", id, user: textValue}),
              });
              setTextValue("");
              if (!response.ok) {
                const error = await response.json();
                console.error('Error saving input:', error);
              } else {
                  fetchPod(id?.toString() || null);
              }
        }
    }

    if (session && pod && session?.user?.email === pod.userId) {
        return (
            <div className="min-h-screen bg-gradient-to-r from-purple-500 via-pink-500 to-red-500">
                <Header />
                <div className="mx-auto p-1 rounded flex justify-center items-center">
                    {<p> Access: {pod.linkAccess ? "Public" : "Private"}</p>}
                    <button
                        className="ml-4 bg-white text-purple-500 font-bold py-2 px-4 rounded hover:bg-opacity-80 transition duration-150 ease-in-out"
                        type="submit"
                        onClick = {(e) => {toggleLinkAccess(e)}}
                    >
                        Toggle
                    </button>
                    <button
                        className="ml-4 bg-white text-purple-500 font-bold py-2 px-4 rounded hover:bg-opacity-80 transition duration-150 ease-in-out"
                        type="submit"
                        onClick = {() => router.push(`/pod/${id}/view`)}
                    >
                        Back
                </button>
                </div>
                <div className="mx-auto p-1 rounded flex justify-center items-center">
                <p> {pod.linkAccess 
                ? "Anyone with link can access" 
                : "Listed users with link can access"}
                </p>
                <button
                    className="ml-4 bg-white text-purple-500 font-bold py-2 px-4 rounded hover:bg-opacity-80 transition duration-150 ease-in-out"
                    type="submit"
                    onClick = {(e) => {handleShare(e)}}
                >
                    Share Link
                </button>
                </div>
                {!pod.linkAccess && 
                <div className="max-w-2xl mx-auto bg-white bg-opacity-10 rounded-lg space-y-4 p-4">
        {pod?.shared?.map((user, index) => (
            <div
                key={index}
                className="bg-white bg-opacity-20 text-white p-1 rounded max-w-2xl mx-auto my-1"
            >
                <div>
                <b>{user}</b>
                </div>
            </div>
        ))}    
            <form onSubmit={(e) => (addUser(e))} className="max-w-2xl mx-auto mt-6 px-4 flex justify-center">
                    <input
                        id="reply-input"
                        className="block bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 border border-white border-opacity-20 rounded p-2 focus:outline-none focus:border-white"
                        type="text"
                        placeholder="Enter user e-mail here"
                        value={textValue}
                        onChange={(e) => setTextValue(e.target.value)}
                    />
                    <button
                        className="ml-4 bg-white text-purple-500 font-bold py-2 px-4 rounded hover:bg-opacity-80 transition duration-150 ease-in-out"
                        type="submit"
                    >
                        Add User
                    </button>
                </form>
            </div>}
            </div>
        )
    }  else if (!session) {
        return (
            <div className="min-h-screen bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 flex flex-col items-center justify-center">
              <Head>
                <title>Check-N-In</title>
              </Head>
              <Landing />
            </div>)
    } else if (pod) {
        return (
        <div className="min-h-screen bg-gradient-to-r from-purple-500 via-pink-500 to-red-500">
            <p>Improper permissions</p>
            <Link href={`/`}>
            <button
                className="mt-4 ml-4 bg-white text-purple-500 font-bold py-1 px-2 rounded hover:bg-opacity-80 transition duration-150 ease-in-out"
            >
                Go back
            </button>
            </Link>
        </div>
        )
    } else {
        return (<div className="min-h-screen bg-gradient-to-r from-purple-500 via-pink-500 to-red-500">
        <Header />
        </div>)
    }
}

export default PodShare;