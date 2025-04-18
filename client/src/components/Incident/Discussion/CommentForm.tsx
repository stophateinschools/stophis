
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface CommentFormProps {
  newComment: string;
  setNewComment: (value: string) => void;
  onSubmit: () => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ 
  newComment, 
  setNewComment, 
  onSubmit 
}) => {
  return (
    <div className="space-y-2 pt-2 border-t">
      <Textarea
        placeholder="Add a comment..."
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        className="min-h-[80px]"
      />
      <div className="flex justify-end">
        <Button 
          onClick={onSubmit} 
          disabled={!newComment.trim()}
        >
          Post Comment
        </Button>
      </div>
    </div>
  );
};

export default CommentForm;
