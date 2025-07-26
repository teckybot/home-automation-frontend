import { useState } from "react";
import { updateSwitch, deleteDevice, updateDevice } from "../services/api";
import { Button, Input, message, Tooltip } from "antd";
import dayjs from "dayjs";

export default function DeviceCard({ device, onRefresh }) {
  const [name, setName] = useState(device.name);
  const [editing, setEditing] = useState(false);
  const [switchState, setSwitchState] = useState(device.switch);
  const [loadingSwitch, setLoadingSwitch] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const toggleSwitch = async () => {
    const newSwitchState = !switchState;
    setLoadingSwitch(true);
    try {
      await updateSwitch(name, newSwitchState);
      setSwitchState(newSwitchState);
      message.success(`${name} turned ${newSwitchState ? "ON" : "OFF"}`);
      onRefresh(true);
    } catch {
      message.error("Failed to toggle device (server offline?)");
    } finally {
      setLoadingSwitch(false);
    }
  };

  const handleDelete = async () => {
    setLoadingDelete(true);
    try {
      await deleteDevice(name);
      message.success(`${name} deleted`);
      onRefresh(true);
    } catch {
      message.error("Failed to delete device (server offline?)");
    } finally {
      setLoadingDelete(false);
    }
  };

  const handleRename = async () => {
    setEditing(false);
    if (name !== device.name) {
      try {
        await updateDevice(device._id, { name });
        message.success(`Renamed to ${name}`);
        onRefresh(true);
      } catch {
        message.error("Rename failed (server offline?)");
        setName(device.name);
      }
    }
  };

  return (
    <div className="p-4 border rounded-xl shadow-md flex flex-col items-center gap-3 bg-white w-64 hover:shadow-lg transition-shadow duration-300">
      {editing ? (
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleRename}
          autoFocus
          className="text-center"
        />
      ) : (
        <h3
          className="font-bold text-lg cursor-pointer hover:text-blue-600"
          onClick={() => setEditing(true)}
        >
          {name}
        </h3>
      )}

      {/* Show Mode (Controller / Monitoring) */}
      <p className="text-gray-500 text-sm">
        {device.mode === "controller" ? "Controller" : "Monitoring"}
      </p>

      {/* Online/Offline Badge */}
      <div>
        {device.deviceStatus ? (
          <span className="px-2 py-1 rounded text-white text-sm bg-green-500">
            Online
          </span>
        ) : (
          <Tooltip
            title={
              device.lastOnline
                ? `Last online: ${dayjs(device.lastOnline).format("DD-MM-YYYY HH:mm:ss")}`
                : "Never connected"
            }
          >
            <span className="px-2 py-1 rounded text-white text-sm bg-red-500 cursor-pointer">
              Offline
            </span>
          </Tooltip>
        )}
      </div>

      {/* Controller vs Monitoring Display */}
      {device.mode === "controller" ? (
        <Button
          type={switchState ? "primary" : "default"}
          loading={loadingSwitch}
          onClick={toggleSwitch}
          className="w-full"
        >
          {switchState ? "ON" : "OFF"}
        </Button>
      ) : (
        <div className="w-full text-center py-2 border rounded bg-gray-100 font-medium">
          Sensor Value: {device.sensorValue ?? "N/A"}
        </div>
      )}

      <Button
        danger
        type="primary"
        loading={loadingDelete}
        onClick={handleDelete}
        className="w-full"
      >
        Delete
      </Button>
    </div>
  );
}
