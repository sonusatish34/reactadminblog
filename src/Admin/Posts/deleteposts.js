import React, { useEffect, useState } from "react";
import { collection, getDocs, query, updateDoc, where, doc, deleteDoc } from "firebase/firestore";
import { fireDb } from "../../firebase"; // Adjust based on your setup
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout"; // Adjust path

const Loader = () => (
  <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-white z-50">
    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const DeletedPosts = () => {
  const [deletedPosts, setDeletedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeletedPosts = async () => {
      try {
        const q = query(collection(fireDb, "blogPost"), where("blog_state", "==", "deleted"));
        const querySnapshot = await getDocs(q);
        const posts = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setDeletedPosts(posts);
      } catch (error) {
        console.error("Error fetching deleted posts:", error);
      } finally {
        setLoading(false); // Stop the loader
      }
    };

    fetchDeletedPosts();
  }, []);

  const handleRestore = async (postId) => {
    const postRef = doc(fireDb, "blogPost", postId);

    Swal.fire({
      icon: "warning",
      title: "Are you sure you want to restore this post?",
      showCancelButton: true,
      confirmButtonText: "Restore",
      confirmButtonColor: "#4caf50",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await updateDoc(postRef, { blog_state: "active" });
          setDeletedPosts(deletedPosts.filter((post) => post.id !== postId));
          Swal.fire("Restored!", "Your post has been restored.", "success");
        } catch (error) {
          Swal.fire("Error", "There was an issue restoring the post.", "error");
        }
      }
    });
  };

  const handlePermanentDelete = async (postId) => {
    const postRef = doc(fireDb, "blogPost", postId);

    Swal.fire({
      icon: "warning",
      title: "Are you sure you want to permanently delete this post?",
      text: "This action cannot be undone.",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#e74c3c",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteDoc(postRef);
          setDeletedPosts(deletedPosts.filter((post) => post.id !== postId));
          Swal.fire("Deleted!", "The post has been permanently deleted.", "success");
        } catch (error) {
          Swal.fire("Error", "There was an issue deleting the post.", "error");
        }
      }
    });
  };

  return (
    <AdminLayout>
      {loading && <Loader />}
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Deleted Posts</h1>
        {deletedPosts.length > 0 ? (
          <table className="min-w-full bg-white text-center">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="w-1/5 py-2">Title</th>
                <th className="w-1/5 py-2">Description</th>
                <th className="w-1/5 py-2">blogFor</th>
                <th className="w-1/5 py-2">Category</th>
                <th className="w-1/5 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {deletedPosts.map((post) => (
                <tr key={post.id} className="border-b">
                  <td className="py-2">{post.title}</td>
                  <td className="py-2">{post.description}</td>
                  <td className="py-2">{post.blogfor}</td>
                  <td className="py-2">{post.categoryname}</td>
                  <td className="py-2 flex justify-around">
                    <button
                      className="p-1 bg-green-500 rounded"
                      onClick={() => handleRestore(post.id)}
                      aria-label="Restore post"
                    >
                      Restore
                    </button>
                    <Link to={`/Admin/Posts/${post.id}`}>
                      <button className="p-1 bg-blue-500 rounded" aria-label="View post">
                        View
                      </button>
                    </Link>
                    <button
                      className="p-1 bg-red-500 rounded"
                      onClick={() => handlePermanentDelete(post.id)}
                      aria-label="Delete post"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          !loading && <p>No deleted posts found.</p>
        )}
      </div>
    </AdminLayout>
  );
};

export default DeletedPosts;


