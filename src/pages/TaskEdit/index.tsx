import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useTasks from "../../hooks/useTasks";
import Loader from "../../components/Loader";
import TaskForm from "../../components/Form";

const TaskEdit = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { getTask, createTask, updateTask, fetchTaskById } = useTasks();
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTask = async () => {
      if (isEdit) {
        const task = getTask(Number(id));
        if (task) {
          setInitialData(task);
        } else {
          const fetched = await fetchTaskById(Number(id));
          if (fetched) setInitialData(fetched);
        }
      }
      setLoading(false);
    };
    loadTask();
  }, [id, isEdit, getTask, fetchTaskById]);

  const handleSubmit = async (data: any) => {
    if (isEdit) await updateTask(Number(id), data);
    else await createTask(data);
    navigate("/dashboard");
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary">
            {isEdit ? "Edit Task" : "New Task"}
          </h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-blue-600 hover:underline"
          >
            Back to Dashboard
          </button>
        </div>
        <TaskForm initialData={initialData} onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default TaskEdit;