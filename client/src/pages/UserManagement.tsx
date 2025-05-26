
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Search, Archive, ArchiveRestore, Edit, AlertTriangle, HelpCircle, UserPlus, ArrowUp, ArrowDown } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function UserManagement() {
  const { users, organizations, archiveUser, unarchiveUser } = useData();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  
  // Update organizations for the example users
  const updatedUsers = users.map(user => {
    if (user.organization !== "ADL" && user.organization !== "Jewish Federation") {
      // Alternate between the two organizations
      return {
        ...user,
        organization: user.id.charCodeAt(0) % 2 === 0 ? "ADL" : "Jewish Federation"
      };
    }
    return user;
  });

  // Updated organizations
  const updatedOrganizations = [
    { id: "adl", name: "ADL" },
    { id: "jewish-federation", name: "Jewish Federation" }
  ];
  
  // Available regions for selection
  const availableRegions = ["Oregon", "Washington", "California", "New York"];
  
  // Check if user is admin
  if (!currentUser?.isAdmin) {
    return (
      <div className="text-center py-10">
        <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="mb-6">You do not have permission to view this page.</p>
        <Button onClick={() => navigate('/dashboard')}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  // Enhanced sorting function for multiple columns
  const handleSort = (column: string) => {
    if (sortBy === column) {
      // If already sorting by this column, toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, set it and default to ascending
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  // Render sort icon for column headers
  const renderSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    return sortDirection === 'asc' ? 
      <ArrowUp className="ml-1 h-4 w-4 inline" /> : 
      <ArrowDown className="ml-1 h-4 w-4 inline" />;
  };

  // Filter users based on search
  const filteredUsers = updatedUsers.filter(user => {
    return search === '' ||
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.organization.toLowerCase().includes(search.toLowerCase()) ||
      user.region.some(r => r.toLowerCase().includes(search.toLowerCase()));
  });

  // Sort users with enhanced multi-column support
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name) * direction;
      case 'organization':
        return a.organization.localeCompare(b.organization) * direction;
      case 'regions':
        // Sort by first region
        const regionA = a.region.length > 0 ? a.region[0] : '';
        const regionB = b.region.length > 0 ? b.region[0] : '';
        return regionA.localeCompare(regionB) * direction;
      case 'role':
        const roleA = a.isAdmin ? 'Admin' : 'Collaborator';
        const roleB = b.isAdmin ? 'Admin' : 'Collaborator';
        return roleA.localeCompare(roleB) * direction;
      case 'incidents':
        return (a.incidentCount - b.incidentCount) * direction;
      default:
        return 0;
    }
  });

  return (
    <TooltipProvider>
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-gray-500">
              Manage users and their access to the dashboard
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-1">
                  <UserPlus className="h-4 w-4" />
                  Add New User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                  <DialogDescription>
                    Invite a new user to collaborate on incident reporting.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="py-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <Input placeholder="Full name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <Input type="email" placeholder="email@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Organization</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select organization" />
                      </SelectTrigger>
                      <SelectContent>
                        {updatedOrganizations.map(org => (
                          <SelectItem key={org.id} value={org.id}>
                            {org.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Region</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRegions.map(region => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Role</label>
                    <Select defaultValue="collaborator">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="collaborator">Collaborator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddUserDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" onClick={() => setAddUserDialogOpen(false)}>
                    Send Invitation
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative flex-grow w-full">
              <Search className="absolute left-2.5 top-3 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search users by name, organization, or region..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Manage user access, roles, and permissions</p>
                <p className="mt-1">- <strong>Admin:</strong> Can manage all users and incidents</p>
                <p>- <strong>Collaborator:</strong> Can report and manage their own incidents</p>
              </TooltipContent>
            </Tooltip>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      Name {renderSortIcon('name')}
                    </TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('organization')}
                    >
                      Organization {renderSortIcon('organization')}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('regions')}
                    >
                      Regions {renderSortIcon('regions')}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('role')}
                    >
                      Role {renderSortIcon('role')}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('incidents')}
                    >
                      Incidents {renderSortIcon('incidents')}
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage src={user.profilePicture} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.organization}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.region.map(region => (
                            <Badge key={region} variant="outline">
                              {region}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant={user.isAdmin ? "default" : "secondary"}>
                              {user.isAdmin ? "Admin" : "Collaborator"}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            {user.isAdmin 
                              ? "Full access to manage users and incidents" 
                              : "Can report and manage their own incidents"}
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        {user.incidentCount > 0 ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div>
                                <Link to={`/admin/audit?user=${user.id}`}>
                                  {user.incidentCount}
                                </Link>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              View incidents reported by this user
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          "0"
                        )}
                      </TableCell>
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant={user.isArchived ? "destructive" : "outline"}>
                              {user.isArchived ? "Archived" : "Active"}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            {user.isArchived 
                              ? "User cannot access the system" 
                              : "User has full access to their allowed features"}
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Edit user information
                                </TooltipContent>
                              </Tooltip>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit User</DialogTitle>
                                <DialogDescription>
                                  Update user information and access settings.
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="py-4">
                                <div className="space-y-4">
                                  <div>
                                    <label className="block text-sm font-medium mb-1">Name</label>
                                    <Input defaultValue={user.name} />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium mb-1">Email</label>
                                    <Input defaultValue={user.email} />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium mb-1">Organization</label>
                                    <Select defaultValue={user.organization}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {updatedOrganizations.map(org => (
                                          <SelectItem key={org.id} value={org.name}>
                                            {org.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium mb-1">Role</label>
                                    <Select defaultValue={user.isAdmin ? "admin" : "collaborator"}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="collaborator">Collaborator</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                              
                              <DialogFooter>
                                <Button type="submit">Save Changes</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          
                          {user.isArchived ? (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <ArchiveRestore className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Restore user access
                                  </TooltipContent>
                                </Tooltip>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Unarchive User</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to unarchive this user? They will regain access to the dashboard.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => unarchiveUser(user.id)}>
                                    Unarchive
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          ) : (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <Archive className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Remove user access
                                  </TooltipContent>
                                </Tooltip>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Archive User</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to archive this user? They will no longer be able to sign in to the dashboard.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => archiveUser(user.id)}
                                    className="bg-destructive text-destructive-foreground"
                                  >
                                    Archive
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {sortedUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}

// Make a way to link to the audit log
function Link({ to, children }: { to: string; children: React.ReactNode }) {
  const navigate = useNavigate();
  
  return (
    <Button 
      variant="link" 
      className="p-0 h-auto" 
      onClick={() => navigate(to)}
    >
      {children}
    </Button>
  );
}
