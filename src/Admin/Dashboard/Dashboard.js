import React, { useState, useEffect } from 'react';
import AdminLayout from "../../layouts/AdminLayout";
import { fireDb } from '../../firebase';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileAlt, faFolder, faUser } from "@fortawesome/free-solid-svg-icons";
import Loading from '../../layouts/Loading';
import { getDocs, collection } from 'firebase/firestore';

/* AnalyticsCard component */
function AnalyticsCard({ title, value, icon, link }) {
  return (
    <a href={link} className="bg-white rounded-lg shadow-md p-4 flex items-center space-x-4 hover:scale-105">
      <FontAwesomeIcon icon={icon} className="text-4xl text-indigo-500" />
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-3xl font-bold mt-2">{value}</p>
      </div>
    </a>
  );
}

function Dashboard() {
  const [postcount, setPostcount] = useState(0);
  const [catgscount, setCatgscount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [listDozzy, setListDozzy] = useState([]);
  const [listDozzyBng, setListDozzyBng] = useState([]);

  const [hydSearch, setHydSearch] = useState('');
  const [bngSearch, setBngSearch] = useState('');

  const [hydShowAll, setHydShowAll] = useState(false);
  const [bngShowAll, setBngShowAll] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const hydResponse = await fetch("https://api.dozzy.com/customer/approved_properties?lat=17&long=78&program_id=1&property_capacity=1000");
      const hydData = await hydResponse.json();
      setListDozzy(hydData?.data?.results || []);

      const bngResponse = await fetch("https://api.dozzy.com/customer/approved_properties?lat=12&long=77&program_id=1&property_capacity=1000");
      const bngData = await bngResponse.json();
      setListDozzyBng(bngData?.data?.results || []);
    }

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const posts = await getDocs(collection(fireDb, "blogPost"));
        const users = await getDocs(collection(fireDb, "users"));
        const catg1 = await getDocs(collection(fireDb, "catgfordozzy"));
        const catg2 = await getDocs(collection(fireDb, "catgforldc"));

        setPostcount(posts.docs.length);
        setUsersCount(users.docs.length);
        setCatgscount(catg1.docs.length + catg2.docs.length);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filterData = (data, searchTerm) => {
    return data.filter(item =>
      [item?.property_name, item?.original_property_name, item?.area_name]
        .some(val => val?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const displayedHydData = hydShowAll ? filterData(listDozzy, hydSearch) : filterData(listDozzy, hydSearch).slice(0, 10);
  const displayedBngData = bngShowAll ? filterData(listDozzyBng, bngSearch) : filterData(listDozzyBng, bngSearch).slice(0, 10);

  const renderTable = (data, title) => (
    <div className="mt-10 w-full overflow-x-auto">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <table style={{ border: '1px solid black', borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr className='bg-gray-100'>
            <th style={{ border: '1px solid black', padding: '8px' }}>Sno</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Property Name</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Property Org Name</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Location</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Property Capacity</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className='capitalize'>
              <td style={{ border: '1px solid black', padding: '8px' }}>{index + 1}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{item?.property_name}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{item?.original_property_name}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{item?.area_name}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{item?.property_capacity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const dashboardContent = isLoading ? (
    <Loading />
  ) : (
    <div className="container mx-auto mt-8 px-4">
      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnalyticsCard title="Total Posts" value={postcount} icon={faFileAlt} link="/Admin/Posts" />
        <AnalyticsCard title="Total Categories in dev" value={catgscount} icon={faFolder} link="/Admin/Categories" />
        <AnalyticsCard title="Total Users" value={usersCount} icon={faUser} link="/Admin/Accounts" />
      </div>

      {/* Hyderabad Section */}
      <div className="mt-10">
        <input
          type="text"
          placeholder="Search Hyderabad properties..."
          value={hydSearch}
          onChange={(e) => setHydSearch(e.target.value)}
          className="border px-4 py-2 rounded-md mb-4 w-full sm:w-1/2"
        />
        
        {renderTable(displayedHydData, "Hyderabad Properties")}
        {filterData(listDozzy, hydSearch).length > 10 && (
          <button
            onClick={() => setHydShowAll(prev => !prev)}
            className="mt-2 text-blue-600 underline"
          >
            {hydShowAll ? "Show Less" : "View All"}
          </button>
        )}
      </div>

      {/* Bangalore Section */}
      <div className="mt-10">
        <input
          type="text"
          placeholder="Search Bangalore properties..."
          value={bngSearch}
          onChange={(e) => setBngSearch(e.target.value)}
          className="border px-4 py-2 rounded-md mb-4 w-full sm:w-1/2"
        />
        {renderTable(displayedBngData, "Bangalore Properties")}
        {filterData(listDozzyBng, bngSearch).length > 10 && (
          <button
            onClick={() => setBngShowAll(prev => !prev)}
            className="mt-2 text-blue-600 underline"
          >
            {bngShowAll ? "Show Less" : "View All"}
          </button>
        )}
      </div>
    </div>
  );

  return <AdminLayout Content={dashboardContent} />;
}

export default Dashboard;
