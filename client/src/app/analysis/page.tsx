"use client";
import React, { useState, useMemo, useEffect, useContext } from "react";
import TaskTable from "../../components/custom/TaskTable";
import { useAnalysis, useTasks } from "../../services/tasks/queries";
import TrendsChart from "../../components/custom/ProductivityTrend";
import PeakHoursChart from "../../components/custom/PeakHrsAnalysis";
import TaskProgressCircle from "../../components/custom/TaskCompleted";
import DelayedTasks from "../../components/custom/DelayedTaskAnalysis";
import { MembersLevel } from "../../types/group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { useGroupsLevelWise } from "../../services/groups/queries";
import { useLogout } from "../../services/user/mutations";
import { AuthContext } from "../context/authcontext";
import { useRouter } from "next/navigation";
import { useUserProfile } from "../../services/user/queries";
import { convertToTask } from "../../utils/taskUtils";

// Original Task interface


// Conversion function


const ProfilePage: React.FC = () => {
  // Filter state
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    startDate: "",
    endDate: "",
  });

  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedParent2, setSelectedParent2] = useState<string | null>(null);
  const [selectedParent, setSelectedParent] = useState<string | null>(null);
  const [filteredMembers, setFilteredMembers] = useState<MembersLevel[]>([]);
  const auth = useContext(AuthContext);
  const router = useRouter();

  // Predefined options for Status and Priority
  const statusOptions = ["Pending", "InProgress", "Completed", "Blocked"];

  const priorityOptions = ["Low", "High"];

  const isAuthenticated = auth?.data?.user?.id;
  //("Auth state:", isAuthenticated ? "Authenticated" : "Not authenticated");

  useEffect(() => {
    // If auth is not loading and the user is not authenticated, redirect to home
    if (!auth?.isLoading && !isAuthenticated) {
      //("User not authenticated, redirecting to home");
      router.push("/");
    }
  }, [isAuthenticated, auth?.isLoading, router]);

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        // Make sure to call the context logout to clean up storage
        auth?.logout();
        router.push("/");
      },
    });
  };

  const { mutate: logout, isPending } = useLogout(); // Use `mutate` from `useMutation`
  // Fetch tasks with filters
  const { data: tasks } = useTasks({
    status: filters.status,
    priority: filters.priority,
    startDate: filters.startDate,
    endDate: filters.endDate,
    userId: selectedParent ?? undefined,
  });

  console.log(tasks);

  const { data } = useGroupsLevelWise();
  console.log(data, "levelWise");

  const {
    data: User,
    isLoading: isLoadingUser,
    error: isUserError,
  } = useUserProfile(selectedParent ? { userId: selectedParent } : {});
  console.log(User, "UserDataAnalysis");

  const {
    data: Analysis,
  } = useAnalysis(selectedParent ? { userId: selectedParent } : {});

  useEffect(() => {
    if (selectedGroup && data?.Data) {
      const selectedGroupNumber = Number(selectedGroup);
      const selectedGroupData = data.Data[selectedGroupNumber];
      console.log(selectedGroupData);

      if (selectedGroupData) {
        setFilteredMembers(selectedGroupData.users);
      }
    } else {
      setFilteredMembers([]);
    }
  }, [selectedGroup, data]);

  // Memoized conversion of tasks
  const tableTasks = useMemo(() => {
    return tasks ? tasks.Data.map(convertToTask) : [];
  }, [tasks]);

  // Handler for filter changes
  const handleFilterChange = (filterName: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: "",
      priority: "",
      startDate: "",
      endDate: "",
    });
  };

  return (
    <>
      <style jsx global>{`
        .bg-blue-50 {
          position: relative;
        }

        .bg-blue-50::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: radial-gradient(
            circle,
            rgba(160, 160, 160, 0.3) 1px,
            transparent 1px
          );
          background-size: 30px 30px;
          pointer-events: none;
          z-index: 1;
        }

        /* Add more star densities with different sizes */
        .bg-blue-50::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: radial-gradient(
            circle,
            rgba(180, 180, 180, 0.15) 0.8px,
            transparent 0.8px
          );
          background-size: 20px 20px;
          background-position: 10px 10px;
          pointer-events: none;
          z-index: 1;
        }

        /* Ensure content stays above the star background */
        .bg-blue-50 > * {
          position: relative;
          z-index: 2;
        }
      `}</style>

      <header className="bg-blue-50">
        <div className="flex justify-end gap-6 items-center px-8 py-4">
          {/* Navigation Items */}
          <div className="flex items-center space-x-6">
            <a href="/dashboard" className="text-gray-600 hover:text-gray-900">
              Dashboard
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900">
              Help
            </a>
            <button
              className="px-4 py-2.5 text-sm font-medium border border-black-1px text-white bg-black hover:bg-white hover:text-black rounded-full"
              onClick={handleLogout}
              disabled={isPending} // Disable button while logging out
            >
              {isPending ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </header>
      <div className="bg-blue-50 pt-10 px-10 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-3 w-full">
  <div className="w-full md:w-auto">
    <Select
      value={selectedGroup || ""}
      onValueChange={setSelectedGroup}
      required
    >
      <SelectTrigger className="w-full md:w-64 lg:w-96 text-black bg-white border-white">
        <SelectValue placeholder="Select a group" />
      </SelectTrigger>
      <SelectContent>
        {Object.values(data?.Data || {}).map((group) => (
          <SelectItem
            key={group.groupId}
            value={group.groupId.toString()}
          >
            {group.groupName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
  
  <div className="w-full md:w-auto">
    <Select
      value={selectedParent2 || ""}
      onValueChange={setSelectedParent2}
    >
      <SelectTrigger
        className="w-full md:w-64 lg:w-96 text-black bg-white border-white"
        disabled={!selectedGroup}
      >
        <SelectValue placeholder="Select a parent (optional)" />
      </SelectTrigger>
      <SelectContent>
        {filteredMembers.map((member) => (
          <SelectItem key={member.id} value={member.id.toString()}>
            {member.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
  
  <button
    className="px-4 py-1.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors w-full md:w-auto"
    onClick={() => setSelectedParent(selectedParent2)}
  >
    Analyze
  </button>
</div>
      </div>

      <div className="bg-blue-50 text-black min-h-screen py-8 flex justify-center analyse">
        <div className="w-full px-4 flex justify-center">
          <div className="max-w-4xl md:min-w-4xl w-full flex flex-col md:flex-row justify-center md:space-x-4 space-y-0 md:space-y-0">
            {/* User Section */}
            <div className="w-full md:w-72 flex-shrink-0">
  {/* User Section */}
  <div className="grid grid-cols-1 gap-3 mb-4">
    <div className="bg-white h-auto min-h-[200px] max-h-[60vh] md:h-[60vh] p-4 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-auto">
      <h3 className="text-sm font-semibold text-gray-600 mb-2">
        User
      </h3>

      {isLoadingUser ? (
        <div className="flex items-center justify-center h-full">
          <p>Loading user data...</p>
        </div>
      ) : isUserError ? (
        <div className="text-red-500">Error loading user data</div>
      ) : User ? (
        <div className="space-y-4">
          {/* User Name */}
          <div>
            <p className="text-sm">
              <span className="text-xs text-gray-500">Name :</span>{" "}
              {User.name}
            </p>
          </div>

          {/* User Email */}
          <div className="text-sm grid grid-cols-[auto_1fr]">
  <span className="text-xs text-gray-500 pr-2">Email:</span>
  <span className="break-words">{User.email}</span>
</div>


          {/* User Groups */}
          <div className="text-sm grid grid-cols-[auto_1fr]">
            <span className="text-xs text-gray-500 pr-2">Groups : </span>
            <div className="flex flex-wrap gap-x-1">
              {User.groups &&
                User.groups.map((group, index) => (
                  <span key={index}>
                    { group.name.toUpperCase()}
                    {index !== User.groups.length - 1 && " , "}
                  </span>
                ))}
            </div>
          </div>

          {/* Task Statistics */}
          <div>
            <h4 className="text-xs text-gray-500">
              Task Completion
            </h4>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-xs text-gray-500">Total Tasks</p>
                <p className="font-medium">
                  {Analysis?.collectiveStats?.totalTasks || 0}
                </p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-xs text-gray-500">
                  On-time Tasks
                </p>
                <p className="font-medium">
                  {Analysis?.collectiveStats?.onTimeTasks || 0}
                </p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-xs text-gray-500">
                  Completed Tasks
                </p>
                <p className="font-medium">
                  {Analysis?.collectiveStats?.completedTasks || 0}
                </p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-xs text-gray-500">
                  Delayed Tasks
                </p>
                <p className="font-medium">
                  {Math.max(
                    0,
                    (Analysis?.collectiveStats?.completedTasks ||
                      0) -
                      (Analysis?.collectiveStats?.onTimeTasks || 0)
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p>No user selected</p>
        </div>
      )}
    </div>
  </div>
</div>

            {/* Main Content Section */}
            <div className="flex-grow flex flex-col space-y-4 w-full">
              {/* Existing Stats Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-white h-72 p-4 flex-row justify-center items-center rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">
                    Task Completion Trend Month Wise
                  </h3>
                  <TaskProgressCircle
                    totalTasks2={Analysis?.collectiveStats?.totalTasks || 0}
                    completedTasks2={
                      Analysis?.collectiveStats?.completedTasks || 0
                    }
                  />
                </div>
                <div className="bg-white h-72 p-4 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">
                    Peak Hours of Completing Tasks
                  </h3>
                  <DelayedTasks
                    onTimeTasks2={Analysis?.collectiveStats?.onTimeTasks || 0}
                    completedTasks2={
                      Analysis?.collectiveStats?.completedTasks || 0
                    }
                    avgCompletionTime2={
                      Analysis?.collectiveStats?.avgCompletionTime || 0
                    }
                  />
                </div>
              </div>

              {/* Existing Solved Problems Section */}
              <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                <h2 className="text-xl font-bold mb-4">Bar Analysis</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <TrendsChart userId={selectedParent || undefined} />
                  <PeakHoursChart userId={selectedParent || undefined} />
                </div>
              </div>

              {/* Recent Submissions Section */}
              <div className="bg-white min-h-80 min-w-80 md:min-w-4xl p-4 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                <h2 className="text-xl font-bold mb-4 text-gray-600">
                  User Tasks{" "}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
                  {/* Status Filter */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 16v-4.414l-3.707-3.707A1 1 0 014 7V3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <select
                      id="status-filter"
                      value={filters.status}
                      onChange={(e) =>
                        handleFilterChange("status", e.target.value)
                      }
                      className="block w-full pl-10 pr-8 py-2.5 h-[42px] text-base bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm appearance-none"
                    >
                      <option value="" className="text-gray-500">
                        All Status
                      </option>
                      {statusOptions.map((status) => (
                        <option
                          key={status}
                          value={status}
                          className="text-gray-800"
                        >
                          {status}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg
                        className="fill-current h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>

                  {/* Priority Filter */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zm-2 4a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1z" />
                      </svg>
                    </div>
                    <select
                      id="priority-filter"
                      value={filters.priority}
                      onChange={(e) =>
                        handleFilterChange("priority", e.target.value)
                      }
                      className="block w-full pl-10 pr-8 py-2.5 h-[42px] text-base bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm appearance-none"
                    >
                      <option value="" className="text-gray-500">
                        All Priorities
                      </option>
                      {priorityOptions.map((priority) => (
                        <option
                          key={priority}
                          value={priority}
                          className="text-gray-800"
                        >
                          {priority}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg
                        className="fill-current h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>

                  {/* Start Date Filter */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <input
                      type="date"
                      id="start-date-filter"
                      value={filters.startDate}
                      onChange={(e) =>
                        handleFilterChange("startDate", e.target.value)
                      }
                      className="block w-full pl-10 pr-3 py-2.5 h-[42px] text-base bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  {/* End Date Filter */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <input
                      type="date"
                      id="end-date-filter"
                      value={filters.endDate}
                      onChange={(e) =>
                        handleFilterChange("endDate", e.target.value)
                      }
                      className="block w-full pl-10 pr-3 py-2.5 h-[42px] text-base bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
                {/* Clear Filters Button */}
                {(filters.status ||
                  filters.priority ||
                  filters.startDate ||
                  filters.endDate) && (
                  <div className="mt-4 text-right">
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
                <div className="md:min-w-[800px]">
                  <TaskTable tasks={tableTasks} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
