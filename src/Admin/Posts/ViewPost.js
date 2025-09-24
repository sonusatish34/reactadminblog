import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import { useState, useEffect } from 'react';
import { collection, doc, getDoc, deleteDoc } from "firebase/firestore";
import { fireDb } from "../../firebase"; // Adjust this import according to your setup
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import Loading from "../../layouts/Loading";
import { Link } from "react-router-dom";
import { BiCategory } from "react-icons/bi";

import Image from "@tiptap/extension-image";
function View() {
  const { id } = useParams();
  return (
    <AdminLayout Content={<Getpost postId={id} />} />
  );
}

function Getpost({ postId }) {
  const [postData, setPostData] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate()
  useEffect(() => {
    const fetchPost = async () => {
      const postRef = doc(fireDb, "blogPost", postId);
      const postSnap = await getDoc(postRef);

      if (postSnap.exists()) {
        setPostData({ id: postSnap.id, ...postSnap.data() });
      } else {
        console.log("No such document!");
      }
      setLoading(false);
    };

    fetchPost();
  }, [postId]);

  const handleDeleteComment = async (commentId) => {
    const commentToDelete = postData?.comments.find((comment) => comment.id === commentId);

    if (commentToDelete) {
      Swal.fire({
        title: 'Delete Comment',
        text: 'Are you sure you want to delete this comment?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        html: `
          <p><strong>Username:</strong> ${commentToDelete.username}</p>
          <p><strong>Comment Body:</strong> ${commentToDelete.body}</p>
          <p><strong>Created At:</strong> ${commentToDelete.created_at}</p>
        `,
      }).then(async (result) => {
        if (result.isConfirmed) {
          // Assuming comments are stored in a separate collection, you'll need to modify this part according to your structure
          const commentRef = doc(fireDb, "comments", commentId); // Adjust the path to where your comments are stored

          await deleteDoc(commentRef); // Delete comment from Firestore

          // Update local postData state
          const updatedComments = postData?.comments.filter((comment) => comment.id !== commentId);
          setPostData({ ...postData, comments: updatedComments });

          Swal.fire('Comment Deleted', 'The comment has been deleted.', 'success');
        }
      });
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={() => navigate(-1)}  // Navigates to the previous page
          className="bg-gray-300 p-2 hover:scale-105 rounded-md text-gray-800"
        >
          &larr; Back
        </button>
        <Link
          to={`/Admin/Posts/UpdatePost/${postId}`}
          className="bg-orange-500 hover:scale-105 text-black px-4 py-2 rounded-md"
        >
          Edit this Post
        </Link>
      </div>

      {loading ? (
        <Loading />
      ) : (

        <div className='flex flex-col lg:px-0 py-2 lg:py-2 text-black'>
            <div className='xl:mx-96 lg:mx-56 mx-6 lg:px-0'>
              <h1 className='lg:text-[40px] lg:leading-normal text-2xl font-bold lg:py-4 py-2 helvetica-font tracking-tight'>{postData?.title}</h1>
              <p className='helvetica-font text-[#6B6B6B] text-base lg:text-xl lg:pb-6 py-2 lg:py-4'>{postData?.description}</p>
            </div>
            <div className='xl:mx-24 lg:mx-16 px-1 lg:px-0 py-3 lg:py-6'>
              <Image
                className="w-full rounded-sm"
                src={postData?.coverimages}
                alt={postData?.cialt}
                width={2000}
                height={2000}
              />
            </div>
            <div className=''>
              <div className="flex items-center flex-wrap lg:gap-6 gap-4 py-3 text-sm lg:text-lg xl:mx-96 lg:mx-56 mxs: mx-6 ">
                <p>{postData?.timetake} min read</p>
                {/* <p>{StaticData(postData?.time.seconds)}</p> */}
                <p className="flex items-center gap-1">
                  <BiCategory className="text-blue-400" />
                  <span>
                    {Array.isArray(postData?.categoryname)
                      ? postData.categoryname.join(", ")
                      : postData?.categoryname}
                  </span>
                </p>
               
              </div>
              <ul className="py-2 flex  items-center justify-start gap-x-8 text-xs lg:text-base xl:mx-96 lg:mx-56 mx-6 ">
                <li className="flex items-center gap-5"><span>{postData?.time}</span>
                  <p>{postData?.date.slice(0, 12)}</p>
                </li>
              </ul>
            </div>
            <div
              className="text-[#242424] lg:text-justify text-base lg:text-[20px] leading-8 lg:leading-9 lg:tracking-wide pt-4 pb-4 px-1 lg:px-0  rounded-lg georgia-font xl:mx-96 lg:mx-56 mx-6 ql-editor blogContent sun-editor"
              dangerouslySetInnerHTML={{ __html: postData?.content }}
            />
            <div
              className="text-[#242424] lg:text-justify text-base lg:text-[20px] leading-8 lg:leading-9 lg:tracking-wide pt-4 pb-4 px-1 lg:px-0  rounded-lg georgia-font xl:mx-96 lg:mx-56 mx-6 sun-editor blogContent"
              dangerouslySetInnerHTML={{ __html: postData?.contentTable }}
            />
           
           
            <div className="pt-4 xl:mx-96 lg:mx-56 mx-6 lg:px-0">
              <p className="text-xl font-semibold">Related Posts</p>
              
            </div>
            
          </div>
      )}
    </>
  );
}

export default View;
