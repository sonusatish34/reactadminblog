import { useParams } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import { useState, useEffect } from 'react';
import { collection, doc, getDoc, deleteDoc } from "firebase/firestore";
import { fireDb } from "../../firebase"; // Adjust this import according to your setup
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import Loading from "../../layouts/Loading";

function View() {
  const { id } = useParams();
  return (
    <AdminLayout Content={<Getpost postId={id} />} />
  );
}

function Getpost({ postId }) {
  const [postData, setPostData] = useState({});
  const [loading, setLoading] = useState(true);

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
    console.log("into i");
    
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
      {loading ? (
        <Loading />
      ) : (
        <div className="shadow-md flex-row px-1 items-center mt-5 pl-5 pt-2 pb-2 mb-2 justify-center rounded-lg ml-10 bg-white">
          <h1 className="mt-2 mb-2 text-2xl font-semibold">Title: {postData?.title}</h1>
          <div className="w-2/3">
            <img src={postData?.picture} alt="" className="w-full h-auto" />
          </div>
          <div className="mt-2 mb-2 max-w-2xl">
            <span className="text-gray-600">Created at: </span>{postData?.createdAt}
          </div>
          <div className="mt-2 mb-2 max-w-2xl">
            <span className="text-gray-600">Updated at: </span>{postData?.updated_at}
          </div>
          <div className="mt-2 mb-2 max-w-2xl">
            <span className="text-gray-600">Likes: </span>{postData?.likes}
          </div>
          <div className="mt-2 mb-2 max-w-2xl">
            <span className="text-gray-600">Category: </span>{postData?.categoryname}
          </div>
          {/* <div className="mt-2 mb-2 max-w-2xl">{postData?.content}</div> */}
          <div dangerouslySetInnerHTML={{__html:postData?.content}}></div>

          <p>hi</p>
          {postData?.comments && postData?.comments.length === 0 ? 
            <div className="mt-2 mb-2 max-w-2xl text-red-500 text-lg font-bold">
              No Comments on this post
            </div>
          : 
            <>
              <div className="mt-2 mb-2 max-w-2xl">Comments:</div>
              <div style={{ width: '50rem' }}>
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="py-2 px-3 bg-gray-200 font-semibold">Username</th>
                      <th className="py-2 px-3 bg-gray-200 font-semibold">Content</th>
                      <th className="py-2 px-3 bg-gray-200 font-semibold">Created at</th>
                      <th className="py-2 px-3 bg-gray-200 font-semibold">Updated at</th>
                      <th className="py-2 px-3 bg-gray-200 font-semibold">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {postData?.comments?.map((comment) => (
                      <tr key={comment.id}>
                        <td className="py-2 px-3">{comment.username}</td>
                        <td className="py-2 px-3">{comment.body}</td>
                        <td className="py-2 px-3">{comment.created_at}</td>
                        <td className="py-2 px-3">{comment.updated_at}</td>
                        <td className="py-2 px-3 text-indigo-500">
                          <FontAwesomeIcon className="hover:cursor-pointer" onClick={() => handleDeleteComment(comment.id)} icon={faTrash} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          }
        </div>
      )}
    </>
  );
}

export default View;
