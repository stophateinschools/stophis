
import React from 'react';
import CommentItem from './Discussion/CommentItem';
import CommentForm from './Discussion/CommentForm';
import DeleteCommentDialog from './Discussion/DeleteCommentDialog';
import { useDiscussion } from './Discussion/useDiscussion';
import { Incident } from '@/lib/types';

interface IncidentDiscussionProps {
  incident: Incident;
}

const IncidentDiscussion: React.FC<IncidentDiscussionProps> = ({ incident }) => {
  const {
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
  } = useDiscussion(incident);

  console.log("in disccusion ",  incident
  )
  
  if (!incident) return null;

  console.log("discussion ", incident.discussion);

  return (
    <div className="space-y-4">
      <div className="space-y-4 max-h-[500px] overflow-y-auto">
        {incident.discussion.length === 0 && (
          <p className="text-muted-foreground text-center py-4">No comments yet.</p>
        )}
        
        {incident.discussion.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            canModify={canUserModifyComment(comment.author.id)}
            onEditComment={handleEditComment}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={handleCancelEdit}
            onDeleteClick={handleDeleteClick}
            isEditing={editingCommentId === comment.id}
            editValue={editCommentValue}
            setEditValue={setEditCommentValue}
          />
        ))}
      </div>
      
      {currentUser && (
        <CommentForm
          newComment={newComment}
          setNewComment={setNewComment}
          onSubmit={handleSubmitComment}
        />
      )}
      
      <DeleteCommentDialog
        isOpen={deleteDialogOpen}
        setIsOpen={setDeleteDialogOpen}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
};

export default IncidentDiscussion;
