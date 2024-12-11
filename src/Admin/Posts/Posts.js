import AdminLayout from "../../layouts/AdminLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSearch, faFilter, faEye, faTrash, faPen, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import Loading from "../../layouts/Loading";
import { collection, getDocs, query, doc, updateDoc, where } from "firebase/firestore";
import { fireDb } from "../../firebase"; // Adjust this import according to your setup
import { useNavigate } from "react-router-dom";

function PostsData({ postsData, currentPage, itemsPerPage, setPostsData }) {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const postsToDisplay = postsData.slice(startIndex, endIndex);

  const uniqueBlogForOptions = Array.from(new Set(postsData.map((post) => post.blogfor)));
  // const uniqueCategoryOptions = Array.from(new Set(postsData.map((post) => post.categoryname)));
  const allCategories = postsData.flatMap(item => item.categoryname);
  const uniqueCategoryOptions = [...new Set(allCategories)];
  console.log(uniqueCategoryOptions,"uniqueCategoryOptions");
  const [selectedBlogFor, setSelectedBlogFor] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleDelete = async (postId) => {
    const stringifiedId = String(postId);
    const postRef = doc(fireDb, "blogPost", stringifiedId);
  
    Swal.fire({
      icon: "warning",
      title: "Are you sure you want to delete this post?",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#d33",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Update the blog_state to "deleted"
          await updateDoc(postRef, {
            blog_state: "deleted",
          });
          // Update the UI by filtering out the deleted post from the posts list
          const updatedPostsData = postsData.filter((post) => String(post.id) !== stringifiedId);
          setPostsData(updatedPostsData);
          Swal.fire("Deleted!", "Your post has been deleted.", "success");
        } catch (error) {
          Swal.fire("Error", "There was an issue deleting the post.", "error");
          console.error("Error deleting post:", error);
        }
      }
    });
  };
  

  const handlePublish = async (postId) => {
    const stringifiedId = String(postId);
    const postRef = doc(fireDb, "blogPost", stringifiedId);

    Swal.fire({
      icon: "warning",
      title: "Are you sure you want to publish this post?",
      showCancelButton: true,
      confirmButtonText: "Publish",
      confirmButtonColor: "#d33",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await updateDoc(postRef, {
            blog_state: "active",
          });
          const updatedPostsData = postsData.filter((post) => String(post.id) !== stringifiedId);
          setPostsData(updatedPostsData);
          Swal.fire("Published!", "Your post has been published.", "success");
        } catch (error) {
          Swal.fire("Error", "There was an issue publishing the post.", "error");
          console.error("Error publishing post:", error);
        }
      }
    });
  };

  // Normalize the selected category before filtering
  const normalizedSelectedCategory = selectedCategory.trim().toLowerCase();

  // Apply filters for category and blogFor
  const filteredPosts = postsToDisplay.filter((post) => {
    // Ensure categoryname is an array and check if selectedCategory is present
    const categoryname = Array.isArray(post.categoryname) ? post.categoryname.map(name => name.toLowerCase()) : [];

    // Log the categoryname and the selected category to debug
    console.log('Selected Category:', normalizedSelectedCategory);
    console.log('Post Categories:', categoryname);

    const isCategoryMatch =
      !normalizedSelectedCategory || categoryname.includes(normalizedSelectedCategory.toLowerCase());

    const isBlogForMatch = !selectedBlogFor || post.blogfor === selectedBlogFor;

    return isCategoryMatch && isBlogForMatch; // Return posts matching both criteria
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Posts</h1>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full bg-white text-center">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="w-1/5 py-2">Title</th>
              <th className="w-1/5 py-2">Description</th>
              <th className="w-28 py-2">
                <select
                  className="w-full p-1 bg-gray-800 border rounded"
                  value={selectedBlogFor}
                  onChange={(e) => setSelectedBlogFor(e.target.value)}
                >
                  <option value="">Blog for</option>
                  {uniqueBlogForOptions.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </th>
              <th className="w-32 py-2">
                <select
                  className="w-full p-1 bg-gray-800 border rounded"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)} // Handle category filter change
                >
                  <option value="">Category</option>
                  {uniqueCategoryOptions.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </th>
              <th className="w-1/5 py-2">Created At</th>
              <th className="w-1/5 py-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <tr key={post.id} className="border-b">
                  <td className="py-2">{post.title}</td>
                  <td className="py-2">{post.description}</td>
                  <td className="py-2">{post.blogfor}</td>
                  <td className="py-2">{post.categoryname}</td>
                  <td className="py-2">{post.date}</td>
                  <td className="py-2 flex flex-col gap-1 px-2 justify-around">
                    <div className="py-2 flex gap-4 px-2 justify-around">
                      <Link to={`/Admin/Posts/${post.id}`}>
                        <FontAwesomeIcon className="text-green-500" icon={faEye} />
                      </Link>
                      <FontAwesomeIcon
                        onClick={() => handleDelete(post.id)}
                        className="text-red-500 cursor-pointer"
                        icon={faTrash}
                      />
                      <Link to={`/Admin/Posts/UpdatePost/${post.id}`}>
                        <FontAwesomeIcon className="text-yellow-500" icon={faPen} />
                      </Link>
                      <button
                        className="p-1 bg-green-500 rounded"
                        onClick={() => handlePublish(post.id)}
                      >
                        Publish
                      </button>
                    </div>
                    <div>
                      <p className="px-1 bg-blue-400 w-fit rounded">
                        {post?.blog_state ? post?.blog_state : ""}
                      </p>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-4">No posts found for the selected filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}



function Posts() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [postsData, setPostsData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedSort, setSelectedSort] = useState("newest");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);

      const qActive = query(collection(fireDb, "blogPost"), where("blog_state", "==", "active"));
      const querySnapshotActive = await getDocs(qActive);
      const activePosts = querySnapshotActive.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const qInProgress = query(collection(fireDb, "blogPost"), where("blog_state", "==", "in-progress"));
      const querySnapshotInProgress = await getDocs(qInProgress);
      const inProgressPosts = querySnapshotInProgress.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const allPosts = [...activePosts, ...inProgressPosts];
      setPostsData(allPosts);
      setLoading(false);
    };

    fetchPosts();
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredPosts = postsData.filter((post) =>
    post?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFilter = () => {
    let sortedPosts = [...postsData];
    switch (selectedSort) {
      case "newest":
        sortedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "oldest":
        sortedPosts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "likes":
        sortedPosts.sort((a, b) => b.likes - a.likes);
        break;
      case "comments":
        sortedPosts.sort((a, b) => b.comment_count - a.comment_count);
        break;
      default:
        break;
    }
    setPostsData(sortedPosts);
  };

  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);

  const PostsContent = (
    <div className="p-4">
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-3">
              <button
                onClick={() => navigate(-1)}
                className="bg-gray-300 p-2 rounded-md text-gray-800"
              >
                &larr; Back
              </button>
              <Link
                to="/Admin/Posts/Create"
                className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                <FontAwesomeIcon icon={faPlus} /> Add Post
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <input
                className="p-2 border rounded-md"
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <FontAwesomeIcon icon={faSearch} />
            </div>
          </div>
          <PostsData
            postsData={filteredPosts}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            setPostsData={setPostsData}
          />
        </>
      )}
    </div>
  );

  return (
    <AdminLayout>
      {PostsContent}
    </AdminLayout>
  );
}

export default Posts;
