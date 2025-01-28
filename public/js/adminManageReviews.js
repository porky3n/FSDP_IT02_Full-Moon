document.addEventListener("DOMContentLoaded", async () => {
    const programmeSelect = document.getElementById("programmeSelect");
    const reviewList = document.getElementById("review-list");

    // Fetch and populate programmes in the dropdown
    const fetchProgrammes = async () => {
        try {
            const response = await fetch("/api/programme");
            if (!response.ok) throw new Error("Failed to fetch programmes");

            const programmes = await response.json();
            console.log("Fetched Programmes:", programmes);

            // Populate dropdown with programme names and IDs
            programmeSelect.innerHTML = programmes
                .map(
                    (programme) =>
                        `<option value="${programme.programmeID}">${programme.programmeName}</option>`
                )
                .join("");

            if (programmes.length > 0) {
                const firstProgrammeID = programmes[0].programmeID; // Access using correct key
                console.log("First Programme ID:", firstProgrammeID);
                loadReviews(firstProgrammeID); // Load reviews for the first programme by default
            } else {
                console.warn("No programmes found.");
            }
        } catch (error) {
            console.error("Error fetching programmes:", error);
        }
    };

    // Fetch and display reviews for a selected programme
    const loadReviews = async (programmeID) => {
        console.log("Loading reviews for Programme ID:", programmeID);
        if (!programmeID) {
            console.error("Invalid Programme ID passed to loadReviews");
            return;
        }
        try {
            const response = await fetch(`/api/programme/${programmeID}/reviews`);
            if (!response.ok) throw new Error("Failed to fetch reviews");

            const reviews = await response.json();
            console.log("Reviews for Programme ID", programmeID, ":", reviews);

            if (reviews.length === 0) {
                reviewList.innerHTML = `<tr><td colspan="5" class="text-center">No reviews found</td></tr>`;
            } else {
                reviewList.innerHTML = reviews
                    .map(
                        (review) => `
                    <tr>
                        <td>${review.ReviewerName}</td>
                        <td>${"★".repeat(review.Rating)}</td>
                        <td>${review.ReviewText}</td>
                        <td>${new Date(review.ReviewDate).toLocaleDateString("en-GB")}</td>
                        <td class="text-end">
                            <button class="btn btn-danger btn-sm delete-btn" data-review-id="${review.ReviewID}">Delete</button>
                        </td>
                    </tr>`
                    )
                    .join("");
            }
        } catch (error) {
            console.error("Error fetching reviews:", error);
        }
    };

    // Handle programme selection change
    programmeSelect.addEventListener("change", (e) => {
        const selectedProgrammeID = e.target.value;
        console.log("Selected Programme ID:", selectedProgrammeID);
        loadReviews(selectedProgrammeID);
    });

    // Handle delete button click
    // Handle delete button click
reviewList.addEventListener("click", async (e) => {
    if (e.target.classList.contains("delete-btn")) {
        const reviewID = e.target.getAttribute("data-review-id");
        if (confirm("Are you sure you want to delete this review?")) {
            try {
                // Corrected URL for DELETE request
                const response = await fetch(`/api/programme/reviews/${reviewID}`, {
                    method: "DELETE",
                });
                if (!response.ok) throw new Error("Failed to delete review");

                console.log("Deleted review with ID:", reviewID);
                e.target.closest("tr").remove(); // Remove review from the UI
                // Display success message
                alert("Review successfully deleted!");
            } catch (error) {
                console.error("Error deleting review:", error);
                alert("Failed to delete review. Please try again.");
            }
        }
    }
});

    // Initial load
    fetchProgrammes();
});
