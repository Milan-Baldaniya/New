import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";

const TermsAndConditions = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Button asChild variant="ghost" className="mb-6">
          <Link to="/register">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Registration
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Terms and Conditions</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing and using the FarmChain Marketplace platform, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please do not use our platform.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">2. User Accounts</h2>
              <p>
                To use our platform, you must register for an account. You agree to:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any security breaches</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">3. User Types and Responsibilities</h2>
              <h3 className="text-lg font-medium mb-2">For Farmers:</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Provide accurate product information</li>
                <li>Maintain product quality standards</li>
                <li>Fulfill orders in a timely manner</li>
                <li>Comply with food safety regulations</li>
              </ul>

              <h3 className="text-lg font-medium mb-2">For Consumers:</h3>
              <ul className="list-disc pl-6">
                <li>Provide accurate delivery information</li>
                <li>Make timely payments</li>
                <li>Communicate clearly with farmers</li>
                <li>Report issues promptly</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">4. Transactions and Payments</h2>
              <p>
                All transactions are processed securely through our platform. We reserve the right to:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>Verify payment information</li>
                <li>Refuse transactions for any reason</li>
                <li>Hold funds in escrow when necessary</li>
                <li>Process refunds according to our policy</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">5. Privacy and Data Protection</h2>
              <p>
                We collect and process your personal data in accordance with our Privacy Policy. By using our platform, you consent to such processing.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">6. Intellectual Property</h2>
              <p>
                All content on our platform, including text, graphics, logos, and software, is the property of FarmChain Marketplace and is protected by intellectual property laws.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">7. Limitation of Liability</h2>
              <p>
                FarmChain Marketplace is not liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the platform.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">8. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">9. Contact Information</h2>
              <p>
                For questions about these terms, please contact us at:
                <br />
                Email: support@farmchain.com
                <br />
                Phone: (555) 123-4567
              </p>
            </section>

            <div className="mt-8 flex justify-center">
              <Button asChild>
                <Link to="/register">Return to Registration</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsAndConditions; 