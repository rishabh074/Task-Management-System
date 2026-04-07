import { Request, Response } from "express";
import prisma from "../utils/prisma";


export const createTask = async (req: any, res: Response) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const task = await prisma.task.create({
      data: {
        title,
        userId: req.user.userId,
      },
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: "Error creating task" });
  }
};


export const getTasks = async (req: any, res: Response) => {
  try {
    const { page = 1, search = "", status } = req.query;

    const tasks = await prisma.task.findMany({
      where: {
        userId: req.user.userId,

        
        title: {
          contains: search,
          mode: "insensitive",
        },

        ...(status !== undefined && {
          completed: status === "true",
        }),
      },
      skip: (Number(page) - 1) * 10,
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks" });
  }
};


export const updateTask = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    const task = await prisma.task.update({
      where: { id },
      data: { title },
    });

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Error updating task" });
  }
};

export const deleteTask = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.task.delete({
      where: { id },
    });

    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting task" });
  }
};


export const toggleTask = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        completed: !task.completed,
      },
    });

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: "Error toggling task" });
  }
};
