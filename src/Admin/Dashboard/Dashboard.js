import React, { useState, useEffect } from 'react';
import AdminLayout from "../../layouts/AdminLayout";
import { fireDb } from '../../firebase';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileAlt, faFolder, faUser } from "@fortawesome/free-solid-svg-icons";
import Loading from '../../layouts/Loading';
import { getDocs, collection } from 'firebase/firestore';
/* AnalyticsCard component */
function AnalyticsCard({ title, value, icon }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex items-center space-x-4">
      <FontAwesomeIcon icon={icon} className="text-4xl text-indigo-500" />
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-3xl font-bold mt-2">{value}</p>
      </div>
    </div>
  );
}

/* Dashboard component */
function Dashboard() {
  const [postcount, setPostcount] = useState(0);
  const [catgscount, setCatgscount] = useState(0);
  const [isLoading, setIsLoading] = useState(true); // Initialize loading state to true

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); // Set loading to true when fetching starts

      try {
        const fetchPosts = async () => {
          const querySnapshot = await getDocs(collection(fireDb, "blogPost"));
          const posts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setPostcount(posts?.length);
        };

        const fetchCatgs = async () => {
          const querySnapshot = await getDocs(collection(fireDb, "categories"));
          const catgs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setCatgscount(catgs?.length);
        };

        await Promise.all([fetchPosts(), fetchCatgs()]); // Ensure both are fetched before stopping loading

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false); // Set loading to false once both data fetching is complete
      }
    };

    fetchData();
  }, []); // Empty dependency array ensures this effect runs only once when the component mounts

  const dashboardContent = isLoading ? (
    <Loading />
  ) : (
    <div className="container mx-auto mt-8 px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnalyticsCard title="Total Posts" value={postcount} icon={faFileAlt} />
        <AnalyticsCard title="Total Categories" value={catgscount} icon={faFolder} />
        <AnalyticsCard title="Total Users" value={0} icon={faUser} />
      </div>
    </div>
  );

  return <AdminLayout Content={dashboardContent} />;
}

export default Dashboard;