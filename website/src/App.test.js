import { render, screen, fireEvent, within } from "@testing-library/react";
import App from "./App";

test("renders site title", () => {
  render(<App />);
  const titleElement = screen.getByRole("heading", {
    name: /Bizarro Fantasy Sports/i,
    level: 1,
  });
  expect(titleElement).toBeInTheDocument();
});

test("renders navigation links", () => {
  render(<App />);
  const nav = screen.getByRole("navigation");
  expect(within(nav).getByText("Home")).toBeInTheDocument();
  expect(within(nav).getByText("Daily Fact")).toBeInTheDocument();
  expect(within(nav).getByText("Uncover")).toBeInTheDocument();
  expect(within(nav).getByText("Upcoming Projects")).toBeInTheDocument();
  expect(within(nav).getByText("Contact Us")).toBeInTheDocument();
});

test("home page is active by default", () => {
  render(<App />);
  expect(
    screen.getByText(/Welcome to the Bizarro Fantasy Sports Home Page/i)
  ).toBeInTheDocument();
});

test("can navigate to Daily Fact page", () => {
  render(<App />);
  const nav = screen.getByRole("navigation");
  const dailyFactLink = within(nav).getByText("Daily Fact");
  fireEvent.click(dailyFactLink);
  expect(
    screen.getByText(/Bizarro has one "Z" and two "R"s/i)
  ).toBeInTheDocument();
});
