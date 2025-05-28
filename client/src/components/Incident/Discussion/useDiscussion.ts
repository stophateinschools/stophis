
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { Incident } from '@/lib/types';
import { useIncidentData } from '@/contexts/IncidentContext';
import { userIsAdmin } from '@/utils/incidentUtils';

export const useDiscussion = (incident: Incident) => {
  const { currentUser } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentValue, setEditCommentValue] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);
  const { toast } = useToast();
  const { addComment, updateComment, deleteComment } = useIncidentData();
  
  const handleSubmitComment = () => {
    if (!currentUser || !newComment.trim()) return;
    
    addComment(incident.id, newComment.trim());
    setNewComment('');
  };

  const handleEditComment = (commentId: string, content: string) => {
    setEditingCommentId(commentId);
    setEditCommentValue(content);
  };
  
  const handleSaveEdit = () => {
    if (!editingCommentId || !editCommentValue.trim()) return;
    
    updateComment(incident.id, editingCommentId, editCommentValue);
    
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
    setDeleteCommentId(commentId);
    setDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = () => {
    if (!deleteCommentId) return;
    
    deleteComment(incident.id, deleteCommentId);
    
    toast({
      title: "Comment deleted",
      description: "Your comment has been deleted"
    });
    
    setDeleteDialogOpen(false);
    setDeleteCommentId(null);
  };
  
  const canUserModifyComment = (userId: string) => {
    if (!currentUser) return false;
    return currentUser.id === userId || userIsAdmin(currentUser);
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
