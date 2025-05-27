
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import { DiscussionComment } from '@/lib/types';

interface CommentItemProps {
  comment: DiscussionComment;
  canModify: boolean;
  onEditComment: (commentId: string, content: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDeleteClick: (commentId: string) => void;
  isEditing: boolean;
  editValue: string;
  setEditValue: (value: string) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  canModify,
  onEditComment,
  onSaveEdit,
  onCancelEdit,
  onDeleteClick,
  isEditing,
  editValue,
  setEditValue
}) => {
  const dateDisplayValue = comment.updatedOn ? comment.updatedOn : comment.createdOn;
  return (
    <div className="flex space-x-3">
      <Avatar>
        <AvatarImage src={comment.author.profilePicture} alt={comment.author.firstName} />
        <AvatarFallback>{comment.author.firstName.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <div className="font-medium">{comment.author.firstName}</div>
          <div className="flex items-center">
            <div className="text-xs text-muted-foreground mr-2">
              {formatDistanceToNow(new Date(dateDisplayValue), { addSuffix: true })}
              {comment.updatedOn && <span className="ml-1">(edited)</span>}
            </div>
            
            {canModify && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={() => onEditComment(comment.id, comment.note)}
                    className="cursor-pointer"
                  >
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onDeleteClick(comment.id)}
                    className="cursor-pointer text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" size="sm" onClick={onCancelEdit}>
                Cancel
              </Button>
              <Button size="sm" onClick={onSaveEdit}>
                Save
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm">{comment.note}</p>
        )}
      </div>
    </div>
  );
};

export default CommentItem;
