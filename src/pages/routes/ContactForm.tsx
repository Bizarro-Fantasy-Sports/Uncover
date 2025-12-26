import React, { useState } from "react";
import "./ContactForm.css";

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
  contact?: string;
}

export function ContactForm(): React.ReactElement {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const formatPhoneNumber = (value: string): string => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 3) {
      return digits;
    }
    if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    }
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(
      6,
      10
    )}`;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    let formattedValue = value;
    if (name === "phone") {
      formattedValue = formatPhoneNumber(value);
    }

    setFormData({ ...formData, [name]: formattedValue });
    setErrors({ ...errors, [name]: "" });
  };

  const validate = (): FormErrors => {
    const newErrors: FormErrors = {};

    // Required fields: Name, Subject, Message, and One Contact Method
    if (!formData.name.trim()) {
      newErrors.name = "Name is required.";
    }
    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required.";
    }
    if (!formData.message.trim()) {
      newErrors.message = "Message is required.";
    }

    if (!formData.email.trim() && !formData.phone.trim()) {
      newErrors.contact = "Please provide either an email or phone number.";
    }

    // Phone validation if provided
    if (formData.phone.trim()) {
      const phoneRegex = /^\(\d{3}\)\s\d{3}-\d{4}$/;
      if (!phoneRegex.test(formData.phone.trim())) {
        newErrors.phone = "Phone number must be in format (###) ###-####";
      }
    }

    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSubmitted(false);
    } else {
      setErrors({});
      setSubmitted(true);
      // TODO: Send form data to email / backend / API
      console.log("Form submitted successfully:", formData);

      // Clear the form after successful submission
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    }
  };

  return (
    <div className="contact-container">
      <h2>Contact Us</h2>
      <form onSubmit={handleSubmit} className="contact-form">
        <label>
          Name*:
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          {errors.name && <p className="error">{errors.name}</p>}
        </label>

        <label>
          Email:
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </label>

        <label>
          Phone:
          <input
            type="tel"
            name="phone"
            placeholder="(123) 456-7890"
            value={formData.phone}
            onChange={handleChange}
            maxLength={14}
          />
          {errors.phone && <p className="error">{errors.phone}</p>}
        </label>

        {errors.contact && <p className="error">{errors.contact}</p>}

        <label>
          Subject*:
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
          />
          {errors.subject && <p className="error">{errors.subject}</p>}
        </label>

        <label>
          Message*:
          <textarea
            name="message"
            rows={5}
            value={formData.message}
            onChange={handleChange}
          ></textarea>
          {errors.message && <p className="error">{errors.message}</p>}
        </label>

        <button type="submit">Submit</button>

        {submitted && (
          <p className="success">Thank you! Your message was sent. </p>
        )}
      </form>
    </div>
  );
}
