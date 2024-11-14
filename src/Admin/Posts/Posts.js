import AdminLayout from "../../layouts/AdminLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSearch, faFilter, faEye, faTrash, faPen, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import Loading from "../../layouts/Loading";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { fireDb } from "../../firebase"; // Adjust this import according to your setup

function PostsData({ postsData, currentPage, itemsPerPage, setPostsData }) {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const postsToDisplay = postsData.slice(startIndex, endIndex);
  console.log(postsData,"------pd----------");
  
  const handleDelete = async (postId) => {
    const stringifiedId = String(postId);  // Make sure postId is a string
    const postRef = doc(fireDb, "blogPost", stringifiedId);
  
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure you want to delete this post?',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#d33',
      cancelButtonText: 'Cancel',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Delete the post from Firestore
          await deleteDoc(postRef);
          
          // Remove the post from local state (postsData)
          const updatedPostsData = postsData.filter(post => String(post.id) !== stringifiedId);
          setPostsData(updatedPostsData);  // Update the state with the filtered list
          
          // Success feedback
          Swal.fire('Deleted!', 'Your post has been deleted.', 'success');
        } catch (error) {
          // Handle error
          Swal.fire('Error', 'There was an issue deleting the post.', 'error');
          console.error("Error deleting post:", error);
        }
      }
    });
  };
  

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Posts</h1>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="w-1/5 py-2">Id</th>
              <th className="w-1/5 py-2">Title</th>
              {/* <th className="w-1/5 py-2">Description</th> */}
              <th className="w-1/5 py-2">Blog for</th>
              <th className="w-1/5 py-2">Category</th>
              <th className="w-1/5 py-2">Created At</th>
              <th className="w-1/5 py-2">Keywords</th>
              <th className="w-1/5 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {postsToDisplay.map((post) => (
              <tr key={post.id} className="text-center border-b">
                <td className="py-2 truncate">{post.id}</td>
                <td className="py-2 truncate">{post.title}</td>
                {/* <td className="py-2 truncate" dangerouslySetInnerHTML={{ __html: post.content }}></td> */}
                <td className="py-2">{post.blogfor}</td>
                <td className="py-2">{post.categoryname}</td>
                <td className="py-2">{post.createdAt}</td>
                <td className="py-2">{post.keywords}</td>
                <td className="py-2 flex gap-4 px-2 justify-around">
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
                </td>
              </tr>
            ))}
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

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const querySnapshot = await getDocs(collection(fireDb, "blogPost"));
      const posts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPostsData(posts);
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
          <div className="flex justify-between mb-4">
            <Link
              to="/Admin/Post/New"
              className="bg-indigo-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-600"
            >
              <FontAwesomeIcon icon={faPlus} /> New Post
            </Link>
            <div className="flex items-center bg-white border rounded-lg shadow-md px-4 py-2">
              <FontAwesomeIcon icon={faSearch} className="text-indigo-500 mr-2" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={handleSearchChange}
                className="outline-none bg-transparent"
              />
              {searchQuery && (
                <FontAwesomeIcon
                  icon={faTimes}
                  onClick={() => setSearchQuery("")}
                  className="text-gray-400 ml-2 cursor-pointer"
                />
              )}
            </div>
            <div className="flex items-center bg-white border rounded-lg shadow-md px-4 py-2">
              <FontAwesomeIcon icon={faFilter} className="text-indigo-500 mr-2" />
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="outline-none bg-transparent"
              >
                <option value="default">Default</option>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="likes">Likes</option>
                <option value="comments">Comments</option>
              </select>
              <button
                onClick={handleFilter}
                className="ml-2 bg-indigo-500 text-white px-4 py-1 rounded-lg hover:bg-indigo-600"
              >
                Filter
              </button>
            </div>
          </div>
          <PostsData
            postsData={filteredPosts}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            setPostsData={setPostsData}
          />
          <div className="flex justify-center mt-4">
            {totalPages > 1 && currentPage > 1 && (
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                className="mr-2 bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Previous
              </button>
            )}
            <span>
              Page {currentPage} of {totalPages}
            </span>
            {totalPages > 1 && currentPage < totalPages && (
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                className="ml-2 bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Next
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );

  return <AdminLayout Content={PostsContent} />;
}

export default Posts;
