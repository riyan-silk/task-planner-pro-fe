import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import TaskForm from "../../components/Form";
import useTasks from "../../hooks/useTasks";
import Loader from "../../components/Loader";


const TaskEdit = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();


  const { getTask, createTask, updateTask } = useTasks();


  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    if (isEdit) {
      const task = getTask(Number(id));
      if (task) setInitialData(task);
    }
    setLoading(false);
  }, [id, isEdit, getTask]);


  const handleSubmit = async (data: any) => {
    if (isEdit) await updateTask(Number(id), data);
    else await createTask(data);


    navigate("/dashboard");
  };


  if (loading) return <Loader />;


  return (
    <div className="min-h-screen bg-background dark:bg-gray-950 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary dark:text-primary-300">
            {isEdit ? "Edit Task" : "New Task"}
          </h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Back
          </button>
        </div>


        <TaskForm initialData={initialData} onSubmit={handleSubmit} />
      </div>
    </div>
  );
};


export default TaskEdit;