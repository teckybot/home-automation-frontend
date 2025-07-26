import { useEffect, useState } from "react";
import { fetchDevices, createDevice, updateSwitch, deleteDevice, updateDevice } from "../services/api";
import { Spin, Alert, Button, message, Select, Table, Input, Tooltip, Tag, Modal, Radio } from "antd";

export default function Dashboard() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [editingName, setEditingName] = useState(null);
  const [newName, setNewName] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [newMode, setNewMode] = useState("controller");

  const loadDevices = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await fetchDevices();
      setDevices(data);
      if (error) message.success("server reconnected!");
      setError(null);
    } catch (err) {
      if (!error) message.error("server unreachable. Retrying...");
      setError("server unreachable. Retrying...");
      setDevices([]);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
    const interval = setInterval(() => {
      if (error) loadDevices();
    }, 3000);
    return () => clearInterval(interval);
  }, [error]);

  useEffect(() => {
    loadDevices();
    const interval = setInterval(() => {
      loadDevices(true);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleAddDevice = async () => {
    try {
      await createDevice({name: undefined, mode: newMode});
      message.success("Device added");
      setModalVisible(false);
      loadDevices(true);
    } catch {
      message.error("Failed to add device. server went offline.");
    }
  };

  const handleToggleSwitch = async (record) => {
    try {
      const newState = !record.switch;
      await updateSwitch(record.name, newState);
      message.success(`Switch turned ${newState ? "ON" : "OFF"} for ${record.name}`);
      loadDevices(true);
    } catch {
      message.error("Failed to toggle switch.");
    }
  };

  const handleDelete = async (record) => {
    try {
      await deleteDevice(record.name);
      message.success(`${record.name} deleted`);
      loadDevices(true);
    } catch {
      message.error("Failed to delete device.");
    }
  };

  const handleRename = async (record) => {
    try {
      await updateDevice(record._id, { name: newName });
      message.success(`Renamed to ${newName}`);
      setEditingName(null);
      setNewName("");
      loadDevices(true);
    } catch {
      message.error("Rename failed.");
    }
  };

  const filteredDevices = () => {
    switch (filter) {
      case "online": return devices.filter((d) => d.deviceStatus);
      case "offline": return devices.filter((d) => !d.deviceStatus);
      case "switchOn": return devices.filter((d) => d.switch);
      case "switchOff": return devices.filter((d) => !d.switch);
      default: return devices;
    }
  };

  const columns = [
    {
      title: "Device Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) =>
        editingName === record._id ? (
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={() => handleRename(record)}
            autoFocus
          />
        ) : (
          <span
            onClick={() => {
              setEditingName(record._id);
              setNewName(record.name);
            }}
            style={{ cursor: "pointer", color: "#1890ff" }}
          >
            {text}
          </span>
        ),
    },
    {
      title: "Mode",
      dataIndex: "mode",
      key: "mode",
      render: (mode) => <Tag color={mode === "controller" ? "blue" : "purple"}>{mode}</Tag>,
    },
    {
      title: "Device Status",
      dataIndex: "deviceStatus",
      key: "deviceStatus",
      render: (status, record) => {
        const formatDate = (dateString) => {
          if (!dateString) return "Unknown";
          const date = new Date(dateString);
          return date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });
        };

        return status ? (
          <Tag color="green" style={{ fontWeight: "bold", padding: "4px 12px" }}>
            Online
          </Tag>
        ) : (
          <Tooltip title={`Last Online: ${formatDate(record.lastOnline)}`}>
            <Tag color="red" style={{ fontWeight: "bold", padding: "4px 12px", cursor: "pointer" }}>
              Offline
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: "Control / Data",
      key: "control",
      render: (_, record) =>
        record.mode === "controller" ? (
          <Button
            type={record.switch ? "primary" : "default"}
            onClick={() => handleToggleSwitch(record)}
          >
            {record.switch ? "ON" : "OFF"}
          </Button>
        ) : (
          <span>{record.sensorValue ?? "N/A"}</span>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button danger onClick={() => handleDelete(record)}>
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-600">
          IOT Connect: <span className="text-gray-700">Control Your World</span>
        </h1>
        <div className="flex gap-4">
          <Select value={filter} onChange={setFilter} style={{ width: 160 }}>
            <Select.Option value="all">All Devices</Select.Option>
            <Select.Option value="online">Online</Select.Option>
            <Select.Option value="offline">Offline</Select.Option>
            <Select.Option value="switchOn">Switch ON</Select.Option>
            <Select.Option value="switchOff">Switch OFF</Select.Option>
          </Select>
          <Button type="primary" onClick={() => setModalVisible(true)} disabled={!!error}>
            + Add Device
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <Spin size="large" />
        </div>
      ) : error ? (
        <Alert message={error} type="error" showIcon />
      ) : (
        <Table rowKey="_id" columns={columns} dataSource={filteredDevices()} pagination={false} bordered />
      )}

      {/* Modal for Adding Device */}
      <Modal
        title="Add New Device"
        open={modalVisible}
        onOk={handleAddDevice}
        onCancel={() => setModalVisible(false)}
        okText="Create Device"
      >
        <Radio.Group value={newMode} onChange={(e) => setNewMode(e.target.value)}>
          <Radio value="controller">Controller (ON/OFF)</Radio>
          <Radio value="monitoring">Monitoring (Sensor)</Radio>
        </Radio.Group>
      </Modal>
    </div>
  );
}
