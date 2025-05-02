
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserRound } from 'lucide-react';

export default function Header() {
  const { currentUser, signOut } = useAuth();
  const location = useLocation();

  const getLinkClass = (path: string) => {
    return location.pathname === path 
      ? "text-shisp-blue font-medium" 
      : "text-shisp-gray hover:text-shisp-blue transition-colors";
  };

  return (
    <header className="border-b border-gray-200 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/dashboard" className="flex items-center">
            <img 
              src="/lovable-uploads/40945ba0-a692-41ef-ba57-e8bec64eaf29.png" 
              alt="Stop Hate in Schools Logo" 
              className="h-10 mr-2"
            />
          </Link>
        </div>

        {currentUser && (
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/guidelines" className={getLinkClass('/guidelines')}>
              Guidelines
            </Link>
            <Link to="/dashboard" className={getLinkClass('/dashboard')}>
              My Dashboard
            </Link>
            <Link to="/incidents" className={getLinkClass('/incidents')}>
              All Incidents
            </Link>
            <Link to="/incidents/add">
              <Button variant="default" size="sm">
                Add Incident
              </Button>
            </Link>
          </nav>
        )}

        <div className="flex items-center">
          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer border-2 border-shisp-blue">
                  <UserRound className="h-5 w-5 text-shisp-blue" />
                  <AvatarFallback className="bg-shisp-blue text-white">{currentUser.firstName?.charAt(0)}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {currentUser.isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin/users" className="w-full">
                      User Management
                    </Link>
                  </DropdownMenuItem>
                )}
                {currentUser.isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin/audit-log" className="w-full">
                      Audit Log
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => signOut()}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/signin">
              <Button variant="default">Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
