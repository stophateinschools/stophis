
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function Guidelines() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Reporting Guidelines</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Purpose of Incident Reporting</CardTitle>
        </CardHeader>
        <CardContent className="prose">
          <p>
            The Stop Hate in Schools dashboard serves to document, track, and respond to incidents 
            of bias, harassment, hate speech, discrimination, and misleading or incorrect curriculum 
            in K-12 school communities. By reporting these incidents, you help:
          </p>
          <ul>
            <li>Create a comprehensive record of incidents across school communities</li>
            <li>Identify patterns that may require coordinated responses</li>
            <li>Develop effective strategies to address and prevent similar incidents</li>
            <li>Support affected students, families, and communities</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Incident Reporting Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <h3 className="text-lg font-medium mb-4">Be Accurate and Specific</h3>
          <ul className="list-disc ml-6 mb-6 space-y-2">
            <li>Include specific dates, locations, and details about what occurred</li>
            <li>Distinguish between firsthand accounts and information from other sources</li>
            <li>Use objective language to describe incidents</li>
            <li>Include relevant context that helps understand the incident</li>
          </ul>

          <Separator className="my-6" />

          <h3 className="text-lg font-medium mb-4">Protect Privacy</h3>
          <ul className="list-disc ml-6 mb-6 space-y-2">
            <li>Use discretion when including names of minors or vulnerable individuals</li>
            <li>Be aware of the sharing settings you select for each incident</li>
            <li>Consider potential impacts of information becoming public</li>
            <li>Mark highly sensitive documents with the "High Privacy" setting</li>
          </ul>

          <Separator className="my-6" />

          <h3 className="text-lg font-medium mb-4">Documentation</h3>
          <ul className="list-disc ml-6 mb-6 space-y-2">
            <li>Include links to relevant policies, news articles, or public statements</li>
            <li>Upload communications, photos, or other evidence when available</li>
            <li>Document follow-up actions and school responses</li>
            <li>Update incident reports as new information becomes available</li>
          </ul>

          <Separator className="my-6" />

          <h3 className="text-lg font-medium mb-4">Collaboration</h3>
          <ul className="list-disc ml-6 space-y-2">
            <li>Use the discussion thread to coordinate responses with other users</li>
            <li>Share incidents appropriately with relevant organizations</li>
            <li>Consider regional sharing for incidents that may affect multiple schools</li>
            <li>Maintain confidentiality based on the sharing settings established</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Publishing Considerations</CardTitle>
        </CardHeader>
        <CardContent className="prose">
          <p>
            When choosing to publish incident reports to stophateinschools.org, consider the following:
          </p>
          <ul>
            <li>
              <strong>Limited publishing</strong> shares only basic details (date, location, summary, type) 
              and is appropriate for most incidents.
            </li>
            <li>
              <strong>Expanded publishing</strong> includes school/district names and supporting materials.
              Choose this option when broader public awareness is important.
            </li>
            <li>
              <strong>No publishing</strong> keeps the incident private within the dashboard user community.
              This may be appropriate for sensitive ongoing situations.
            </li>
          </ul>
          <p>
            Remember that published incidents become accessible to the public and may be viewed by 
            students, parents, educators, media, and school officials.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Categories and Definitions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Bullying or Harassment</h3>
              <p className="text-gray-600">
                Repeated unwanted aggressive behavior involving power imbalance, including verbal, 
                social, or physical actions targeting a student's identity or characteristics.
              </p>
            </div>

            <div>
              <h3 className="font-medium">Biased, False or Misleading Curriculum</h3>
              <p className="text-gray-600">
                Educational materials that contain factual errors, omit significant perspectives or 
                historical contexts, or present information in a way that reinforces stereotypes or bias.
              </p>
            </div>

            <div>
              <h3 className="font-medium">Demonstration or Other Event</h3>
              <p className="text-gray-600">
                Organized protests, rallies, or events (on or off campus) that involve bias, hate speech, 
                discrimination, or responses to these issues.
              </p>
            </div>

            <div>
              <h3 className="font-medium">Erasure or Silencing</h3>
              <p className="text-gray-600">
                Actions that remove, prohibit, or discourage representation of marginalized groups 
                or perspectives in curriculum, school activities, or educational spaces.
              </p>
            </div>

            <div>
              <h3 className="font-medium">Graffiti or Vandalism</h3>
              <p className="text-gray-600">
                Defacement of school property with hateful messages, symbols, or targeted destruction 
                of cultural, religious, or identity-based displays or materials.
              </p>
            </div>

            <div>
              <h3 className="font-medium">Physical Assault</h3>
              <p className="text-gray-600">
                Violence or threats of violence targeting individuals based on their identity or perceived group membership.
              </p>
            </div>

            <div>
              <h3 className="font-medium">Professional Development</h3>
              <p className="text-gray-600">
                Teacher or staff training that promotes biased perspectives, uses inappropriate materials, 
                or fails to address issues of equity and inclusion.
              </p>
            </div>

            <div>
              <h3 className="font-medium">Published Materials</h3>
              <p className="text-gray-600">
                Books, articles, social media posts, or other content (on or offline) that contains 
                biased or harmful content related to school communities.
              </p>
            </div>

            <div>
              <h3 className="font-medium">School Administration</h3>
              <p className="text-gray-600">
                Actions or policies implemented by principals, superintendents, or other administrators 
                that create, allow, or fail to address bias or discrimination.
              </p>
            </div>

            <div>
              <h3 className="font-medium">School Board</h3>
              <p className="text-gray-600">
                Decisions, policies, or statements by school board members that impact equity, 
                inclusion, or create hostile environments in schools.
              </p>
            </div>

            <div>
              <h3 className="font-medium">Teacher Issue</h3>
              <p className="text-gray-600">
                Classroom-specific incidents involving teacher behavior, statements, or instructional 
                practices that demonstrate bias or create hostile environments.
              </p>
            </div>

            <div>
              <h3 className="font-medium">Other</h3>
              <p className="text-gray-600">
                Incidents that don't fit clearly into the above categories but involve bias, harassment, 
                hate speech, discrimination, or misinformation in educational settings.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
