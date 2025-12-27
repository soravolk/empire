import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Category from "../Category";

describe("Category Component - Update functionality", () => {
  const mockCategories = [
    { id: 1, name: "Work" },
    { id: 2, name: "Personal" },
  ];

  it("should display edit input when double-clicking a category", async () => {
    const user = userEvent.setup();
    const onModify = jest.fn();

    render(
      <Category
        categories={mockCategories}
        selectedCategoryId={null}
        onChangeSelected={jest.fn()}
        onModify={onModify}
      />,
    );

    const workButton = screen.getByText("Work");
    await user.dblClick(workButton);

    // Should show input field with current name
    await waitFor(() => {
      const input = screen.getByDisplayValue("Work");
      expect(input).toBeInTheDocument();
    });
  });

  it("should call onModify when saving edited category", async () => {
    const user = userEvent.setup();
    const onModify = jest.fn().mockResolvedValue(undefined);

    render(
      <Category
        categories={mockCategories}
        selectedCategoryId={null}
        onChangeSelected={jest.fn()}
        onModify={onModify}
      />,
    );

    // Start editing
    const workButton = screen.getByText("Work");
    await user.dblClick(workButton);

    // Wait for edit mode to activate
    const input = await screen.findByDisplayValue("Work");

    // Change the name
    await user.clear(input);
    await user.type(input, "Updated Work");

    // Save by pressing Enter
    await user.type(input, "{Enter}");

    await waitFor(() => {
      expect(onModify).toHaveBeenCalledWith(1, "Updated Work");
      // Ensure component exits edit mode
      expect(
        screen.queryByDisplayValue("Updated Work"),
      ).not.toBeInTheDocument();
    });
  });

  it("should trim whitespace when saving", async () => {
    const user = userEvent.setup();
    const onModify = jest.fn().mockResolvedValue(undefined);

    render(
      <Category
        categories={mockCategories}
        selectedCategoryId={null}
        onChangeSelected={jest.fn()}
        onModify={onModify}
      />,
    );

    const workButton = screen.getByText("Work");
    await user.dblClick(workButton);

    const input = await screen.findByDisplayValue("Work");
    await user.clear(input);
    await user.type(input, "  Trimmed  ");
    await user.type(input, "{Enter}");

    await waitFor(() => {
      expect(onModify).toHaveBeenCalledWith(1, "Trimmed");
      // Ensure component exits edit mode
      expect(screen.queryByDisplayValue("Trimmed")).not.toBeInTheDocument();
    });
  });

  it("should cancel edit on Escape key", async () => {
    const user = userEvent.setup();
    const onModify = jest.fn();

    render(
      <Category
        categories={mockCategories}
        selectedCategoryId={null}
        onChangeSelected={jest.fn()}
        onModify={onModify}
      />,
    );

    const workButton = screen.getByText("Work");
    await user.dblClick(workButton);

    const input = await screen.findByDisplayValue("Work");
    await user.type(input, " Changed");
    await user.type(input, "{Escape}");

    await waitFor(() => {
      expect(screen.getByText("Work")).toBeInTheDocument();
      expect(
        screen.queryByDisplayValue("Work Changed"),
      ).not.toBeInTheDocument();
    });

    expect(onModify).not.toHaveBeenCalled();
  });

  it("should save on blur", async () => {
    const user = userEvent.setup();
    const onModify = jest.fn().mockResolvedValue(undefined);

    render(
      <Category
        categories={mockCategories}
        selectedCategoryId={null}
        onChangeSelected={jest.fn()}
        onModify={onModify}
      />,
    );

    const workButton = screen.getByText("Work");
    await user.dblClick(workButton);

    const input = await screen.findByDisplayValue("Work");
    await user.clear(input);
    await user.type(input, "New Name");
    await user.tab();

    await waitFor(() => {
      expect(onModify).toHaveBeenCalledWith(1, "New Name");
      // Ensure component exits edit mode after blur
      expect(screen.queryByDisplayValue("New Name")).not.toBeInTheDocument();
    });
  });

  it("should not save if name is empty or whitespace only", async () => {
    const user = userEvent.setup();
    const onModify = jest.fn();

    render(
      <Category
        categories={mockCategories}
        selectedCategoryId={null}
        onChangeSelected={jest.fn()}
        onModify={onModify}
      />,
    );

    const workButton = screen.getByText("Work");
    await user.dblClick(workButton);

    const input = await screen.findByDisplayValue("Work");
    await user.clear(input);
    await user.type(input, "   ");
    await user.type(input, "{Enter}");

    expect(onModify).not.toHaveBeenCalled();
  });

  it("should show edit button when category is selected and onModify is provided", () => {
    const onModify = jest.fn();

    render(
      <Category
        categories={mockCategories}
        selectedCategoryId={1}
        onChangeSelected={jest.fn()}
        onModify={onModify}
      />,
    );

    const editButton = screen.getByTitle("Edit selected category");
    expect(editButton).toBeInTheDocument();
  });

  it("should not show edit button when onModify is not provided", () => {
    render(
      <Category
        categories={mockCategories}
        selectedCategoryId={1}
        onChangeSelected={jest.fn()}
      />,
    );

    const editButton = screen.queryByTitle("Edit selected category");
    expect(editButton).not.toBeInTheDocument();
  });
});
