
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useToast } from "@/hooks/use-toast";
import { Incident } from '@/lib/types';

export const useDiscussion = (incident: Incident) => {
  const { currentUser } = useAuth();
  const { addComment, updateComment, deleteComment } = useData();
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentValue, setEditCommentValue] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  
  const handleSubmitComment = () => {
    if (!currentUser || !newComment.trim()) return;
    
    addComment(incident.id, {
      userId: currentUser.id,
      userName: currentUser.firstName + ' ' + currentUser.lastName,
      userPhotoURL: currentUser.profilePicture,
      timestamp: new Date().toISOString(),
      content: newComment
    });
    
    setNewComment('');
  };

  const handleEditComment = (commentId: string, content: string) => {
    setEditingCommentId(commentId);
    setEditCommentValue(content);
  };
  
  const handleSaveEdit = () => {
    if (!editingCommentId || !editCommentValue.trim()) return;
    
    updateComment(incident.id, editingCommentId, {
      content: editCommentValue,
      edited: true,
      editTimestamp: new Date().toISOString()
    });
    
    toast({
      title: "Comment updated",
      description: "Your comment has been updated successfully"
    });
    
    setEditingCommentId(null);
    setEditCommentValue('');
  };
  
  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditCommentValue('');
  };
  
  const handleDeleteClick = (commentId: string) => {
    setCommentToDelete(commentId);
    setDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = () => {
    if (!commentToDelete) return;
    
    deleteComment(incident.id, commentToDelete);
    
    toast({
      title: "Comment deleted",
      description: "Your comment has been deleted"
    });
    
    setDeleteDialogOpen(false);
    setCommentToDelete(null);
  };
  
  const canUserModifyComment = (userId: string) => {
    if (!currentUser) return false;
    return currentUser.id === userId || currentUser.isAdmin;
  };

  return {
    currentUser,
    newComment,
    setNewComment,
    editingCommentId,
    editCommentValue,
    setEditCommentValue,
    deleteDialogOpen,
    setDeleteDialogOpen,
    handleSubmitComment,
    handleEditComment,
    handleSaveEdit,
    handleCancelEdit,
    handleDeleteClick,
    handleConfirmDelete,
    canUserModifyComment
  };
};
