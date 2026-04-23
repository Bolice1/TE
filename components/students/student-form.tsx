"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Plus, Trash2 } from "lucide-react";

interface Parent {
  name: string;
  relationship: "father" | "mother" | "guardian";
  phone: string;
  email: string;
  isEmergencyContact: boolean;
}

interface StudentFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  isOrphan: boolean;
  guardianInfo: {
    name: string;
    relationship: string;
    phone: string;
    email: string;
  };
  parents: Parent[];
  notes: string;
}

interface StudentFormProps {
  initialData?: StudentFormData;
  studentId?: string;
}

const defaultFormData: StudentFormData = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "",
  address: {
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  },
  isOrphan: false,
  guardianInfo: {
    name: "",
    relationship: "",
    phone: "",
    email: "",
  },
  parents: [],
  notes: "",
};

export function StudentForm({ initialData, studentId }: StudentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<StudentFormData>(
    initialData || defaultFormData
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = studentId ? `/api/students/${studentId}` : "/api/students";
      const method = studentId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save student");
      }

      toast.success(
        studentId ? "Student updated successfully" : "Student added successfully"
      );
      router.push("/dashboard/students");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const addParent = () => {
    setFormData((prev) => ({
      ...prev,
      parents: [
        ...prev.parents,
        {
          name: "",
          relationship: "father",
          phone: "",
          email: "",
          isEmergencyContact: false,
        },
      ],
    }));
  };

  const removeParent = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      parents: prev.parents.filter((_, i) => i !== index),
    }));
  };

  const updateParent = (index: number, field: keyof Parent, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      parents: prev.parents.map((parent, i) =>
        i === index ? { ...parent, [field]: value } : parent
      ),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) =>
                  setFormData({ ...formData, dateOfBirth: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) =>
                  setFormData({ ...formData, gender: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle>Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="street">Street Address</Label>
            <Input
              id="street"
              value={formData.address.street}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: { ...formData.address, street: e.target.value },
                })
              }
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.address.city}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, city: e.target.value },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State/Province</Label>
              <Input
                id="state"
                value={formData.address.state}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, state: e.target.value },
                  })
                }
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                value={formData.address.postalCode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, postalCode: e.target.value },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.address.country}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, country: e.target.value },
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orphan Status */}
      <Card>
        <CardHeader>
          <CardTitle>Family Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Is this student an orphan?</Label>
              <p className="text-sm text-muted-foreground">
                Enable this to enter guardian information instead of parent
                contacts
              </p>
            </div>
            <Switch
              checked={formData.isOrphan}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isOrphan: checked })
              }
            />
          </div>

          {formData.isOrphan ? (
            <div className="pt-4 border-t space-y-4">
              <h4 className="font-medium">Guardian Information</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="guardianName">Guardian Name</Label>
                  <Input
                    id="guardianName"
                    value={formData.guardianInfo.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        guardianInfo: {
                          ...formData.guardianInfo,
                          name: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guardianRelationship">Relationship</Label>
                  <Input
                    id="guardianRelationship"
                    placeholder="e.g., Uncle, Aunt, Grandparent"
                    value={formData.guardianInfo.relationship}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        guardianInfo: {
                          ...formData.guardianInfo,
                          relationship: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="guardianPhone">Phone</Label>
                  <Input
                    id="guardianPhone"
                    type="tel"
                    value={formData.guardianInfo.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        guardianInfo: {
                          ...formData.guardianInfo,
                          phone: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guardianEmail">Email (Optional)</Label>
                  <Input
                    id="guardianEmail"
                    type="email"
                    value={formData.guardianInfo.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        guardianInfo: {
                          ...formData.guardianInfo,
                          email: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="pt-4 border-t space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Parent/Guardian Contacts</h4>
                <Button type="button" variant="outline" size="sm" onClick={addParent}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Parent
                </Button>
              </div>

              {formData.parents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No parent contacts added yet. Click &quot;Add Parent&quot; to add one.
                </p>
              ) : (
                <div className="space-y-4">
                  {formData.parents.map((parent, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg space-y-4 relative"
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 text-destructive"
                        onClick={() => removeParent(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Name *</Label>
                          <Input
                            value={parent.name}
                            onChange={(e) =>
                              updateParent(index, "name", e.target.value)
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Relationship *</Label>
                          <Select
                            value={parent.relationship}
                            onValueChange={(value) =>
                              updateParent(index, "relationship", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="father">Father</SelectItem>
                              <SelectItem value="mother">Mother</SelectItem>
                              <SelectItem value="guardian">Guardian</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Phone *</Label>
                          <Input
                            type="tel"
                            value={parent.phone}
                            onChange={(e) =>
                              updateParent(index, "phone", e.target.value)
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Email (Optional)</Label>
                          <Input
                            type="email"
                            value={parent.email}
                            onChange={(e) =>
                              updateParent(index, "email", e.target.value)
                            }
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={parent.isEmergencyContact}
                          onCheckedChange={(checked) =>
                            updateParent(index, "isEmergencyContact", checked)
                          }
                        />
                        <Label>Emergency Contact</Label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Any additional notes about this student..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Spinner className="mr-2" />}
          {studentId ? "Update Student" : "Add Student"}
        </Button>
      </div>
    </form>
  );
}
