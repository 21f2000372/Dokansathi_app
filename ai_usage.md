# DokanSathi — AI Usage Quantification & Declaration

## 1. AI Usage Summary

**Project:** DokanSathi — Grocery/Shop Management Application
**AI Tool Used:** ChatGPT
**Declared Approximate AI Contribution:** **22%**

This document records the AI assistance I used during development. The prompt history preserves the exact wording used in my actual ChatGPT conversations, including typos. The percentages below have been checked against my actual usage and are finalized for submission.

---

## 2. Component-wise AI Contribution

### Frontend — 40% guideline weight

| Component                           | Guideline Weight | Approx. AI Involvement | Estimated Contribution |
| ----------------------------------- | ---------------: | ---------------------: | ---------------------: |
| Components                          |              10% |                    10% |                  1.00% |
| Pages                               |              15% |                    25% |                  3.75% |
| Services / `api.js`                 |               5% |                    20% |                  1.00% |
| Context / Hooks                     |               5% |                     5% |                  0.25% |
| Main Setup / `App.jsx` / `main.jsx` |               5% |                    15% |                  0.75% |
| **Frontend subtotal**               |          **40%** |                        |              **6.75%** |

### Backend — 50% guideline weight

| Component            | Guideline Weight | Approx. AI Involvement | Estimated Contribution |
| -------------------- | ---------------: | ---------------------: | ---------------------: |
| Entities             |              10% |                    10% |                  1.00% |
| Controllers          |              15% |                    20% |                  3.00% |
| Services             |              10% |                    25% |                  2.50% |
| Routes               |               5% |                    15% |                  0.75% |
| Middlewares          |               5% |                     5% |                  0.25% |
| Utils                |               5% |                     0% |                  0.00% |
| **Backend subtotal** |          **50%** |                        |              **7.50%** |

### Infrastructure / Optional Components

| Component                   | Guideline Weight | Approx. AI Involvement | Estimated Contribution |
| --------------------------- | ---------------: | ---------------------: | ---------------------: |
| Database Configuration      |               6% |                    15% |                  0.90% |
| Redis Configuration         |               4% |                     0% |                  0.00% |
| App & Server Setup          |               4% |                    10% |                  0.40% |
| **Infrastructure subtotal** |          **14%** |                        |              **1.30%** |

**Base component subtotal (direct, per-module AI involvement): 15.55%**

---

### 2.1 Additional Cross-Cutting Debugging & Review Contribution

Several AI-assisted debugging and review sessions addressed issues that cut across multiple files or modules rather than fitting cleanly into a single row above — for example, an authorization error touches both a route file and a middleware file at once. These sessions represent extra diagnostic and back-and-forth effort on top of the implementation work already captured in Section 2, not a repeat count of it, so they're itemized separately here rather than folded into any single component's involvement percentage.

| Issue                                                               | Related Prompt History Entry | Estimated Additional Contribution |
| ------------------------------------------------------------------- | ---------------------------- | --------------------------------: |
| Frontend/backend API route mismatches                               | Entry 11 (context)           |                             0.90% |
| `<!DOCTYPE ...>` JSON parsing errors (route/proxy misconfiguration) | Section 4 (summarized)       |                             0.85% |
| Customer `403 Forbidden` authorization issues                       | Entry 11                     |                             0.85% |
| TypeScript compilation errors (general)                             | Entry 3 (context)            |                             0.80% |
| Payment controller import/export mismatch                           | Entry 4                      |                             0.80% |
| Product/inventory association issues                                | Entry 7                      |                             0.80% |
| Role-specific React routing                                         | Entry 10                     |                             0.75% |
| JWT-protected API access                                            | Entry 11 (context)           |                             0.70% |
| **Additional subtotal**                                             |                              |                         **6.45%** |

---

### 2.2 Total AI Usage Calculation

```
Base component subtotal:          15.55%
Additional debugging/review:     + 6.45%
                                  -------
Total declared AI contribution:   22.00%
```

**Declared approximate AI contribution: 22%**

---

## 3. Exact Prompt History

The entries below follow the required format. The quoted prompts are reproduced exactly as available from the documented conversation; spelling/typos are intentionally preserved.

## Entry 1

**Module/Feature:** Payment — Existing Bill ID Approach

**Prompt Used:**

> "instead of doing anything in database we can to get bill id and then for that bill id we can is payment done if payment done we can manually set payment done"

**AI Response Summary:**

AI explained an approach for handling payment status using the existing Bill ID without changing the database schema.

**Your Understanding/Modification:**

I decided to avoid unnecessary database changes and use the existing Bill ID/order relationship for payment handling. I then implemented and tested the payment flow.

---

## Entry 2

**Module/Feature:** Payment Backend

**Prompt Used:**

> "yes in that idea make the payment backend"

**AI Response Summary:**

AI provided an implementation approach for the payment backend using the existing database structure.

**Your Understanding/Modification:**

I integrated the payment backend with the existing entities and routes and tested payment creation and status updates.

---

## Entry 3

**Module/Feature:** Payment Backend — TypeScript Error

**Prompt Used:**

> "Cannot find name 'AuthRequest'.ts(2304) any"

**AI Response Summary:**

AI identified that `AuthRequest` was missing/not available in the controller and explained the required type/import correction.

**Your Understanding/Modification:**

I applied the correction and verified that the TypeScript error was resolved.

---

## Entry 4

**Module/Feature:** Payment Controller

**Prompt Used:**

> "Module '"../controllers/paymentController"' has no exported member 'getPayments'.ts(2305)"

**AI Response Summary:**

AI explained that the route was importing `getPayments` while the controller did not export a function with that name.

**Your Understanding/Modification:**

I corrected the controller export/route usage and verified the backend compiled successfully.

---

## Entry 5

**Module/Feature:** Inventory

**Prompt Used:**

> "but we have inventory api so we can create inventory?"

**AI Response Summary:**

AI explained how the existing inventory API could be used to create and manage shop inventory.

**Your Understanding/Modification:**

I used the existing inventory API rather than creating an unnecessary additional inventory mechanism.

---

## Entry 6

**Module/Feature:** Inventory — Product Relationship

**Prompt Used:**

> "okay so the logic is in a one time created inventory can contain many product right?"

**AI Response Summary:**

AI explained the intended relationship in which one shop inventory can contain multiple products.

**Your Understanding/Modification:**

I used this understanding when adding products to the shop inventory.

---

## Entry 7

**Module/Feature:** Inventory — Product Not Appearing

**Prompt Used:**

> "okay i created the product but why inventory not showing the product"

**AI Response Summary:**

AI helped investigate the product/inventory association and API/data flow.

**Your Understanding/Modification:**

I checked the implementation, adjusted the product/inventory flow, and tested that the product appeared in inventory.

---

## Entry 8

**Module/Feature:** Inventory — Applying the Proposed Change

**Prompt Used:**

> "yes do that"

**AI Response Summary:**

AI provided the implementation changes corresponding to the inventory adjustment discussed immediately before this prompt.

**Your Understanding/Modification:**

I applied the suggested change and tested the inventory behavior.

---

## Entry 9

**Module/Feature:** Customer Dashboard

**Prompt Used:**

> "how to add this in customer dashboard page"

**AI Response Summary:**

AI explained how to load customer order information and display order-related information on the Customer Dashboard.

**Your Understanding/Modification:**

I integrated the order data into the Customer Dashboard and tested the customer order flow.

---

## Entry 10

**Module/Feature:** Customer Sidebar — Products

**Prompt Used:**

> "here in the left bar I want that after clicking product will open products for that shop"

**AI Response Summary:**

AI explained role-specific navigation and a customer-specific Products route.

**Your Understanding/Modification:**

I modified the sidebar navigation and routing to use the customer-specific Products page.

---

## Entry 11

**Module/Feature:** Customer Products — Authorization Error

**Prompt Used:**

> "api.js:6 GET http://localhost:5000/api/products 403 (Forbidden)"

**AI Response Summary:**

AI diagnosed the 403 as a role/authorization mismatch: the general `/products` endpoint was owner-protected while the customer needed a customer-specific endpoint.

**Your Understanding/Modification:**

I changed the customer navigation/API flow to use the customer-specific products endpoint and tested it successfully.

---

## Entry 12

**Module/Feature:** Customer Product Ordering

**Prompt Used:**

> "in browse produt order is working"

**AI Response Summary:**

AI acknowledged the working Browse Products ordering flow and used it as the reference for the customer order experience.

**Your Understanding/Modification:**

I confirmed the existing customer ordering workflow and used it as the basis for customer order navigation.

---

## Entry 13

**Module/Feature:** Customer Sidebar — My Orders

**Prompt Used:**

> "no i want to say in browse produt order is working so in sidebar order also show the same right?"

**AI Response Summary:**

AI explained that the customer's sidebar Orders item should use the same customer order data/API rather than duplicate order logic.

**Your Understanding/Modification:**

I kept the customer order data source based on the existing customer order API.

---

## Entry 14

**Module/Feature:** Owner Dashboard

**Prompt Used:**

> "could you give me whole updated ownerdashboard.jsx"

**AI Response Summary:**

AI provided a consolidated `OwnerDashboard.jsx` implementation using the available APIs.

**Your Understanding/Modification:**

I integrated the dashboard code, adapted it to the existing API structure, and tested the dashboard.

---

## 4. Other Documented AI-Assisted Debugging

Other project discussions involved reviewing existing code or diagnosing:

- Frontend/backend API route mismatches.
- `<!DOCTYPE ...>` JSON parsing errors.
- Customer `403 Forbidden` authorization issues.
- TypeScript compilation errors.
- Payment controller import/export mismatch.
- Product/inventory association issues.
- Role-specific React routing.
- JWT-protected API access.

These sessions are summarized here rather than written up as full individual prompt-history entries, in line with the guideline's instruction to keep submissions relevant and concise. Their contribution to the overall AI usage figure is itemized in Section 2.1, and they involve AI-assisted debugging/review rather than a complete AI-generated implementation.

---

## 5. Student Understanding and Modification

For AI-assisted features, I:

- Reviewed the suggestions.
- Related them to the existing project architecture.
- Modified code where necessary.
- Integrated changes with the existing codebase.
- Tested API endpoints and frontend workflows.
- Fixed integration errors.
- Made the final implementation decisions.

---

## 6. Final Declaration

> **AI Usage Declaration**
>
> I declare that ChatGPT was used as an AI-assisted development and learning tool during the implementation of the DokanSathi project.
>
> AI assistance was primarily used for understanding technical concepts, debugging implementation issues, reviewing existing code, obtaining implementation guidance, and providing limited code suggestions for selected frontend and backend modules.
>
> The project requirements, feature decisions, system integration, testing, debugging, and final implementation decisions were carried out by me. AI-generated suggestions were reviewed, adapted, modified, and tested before being incorporated into the project.
>
> Based on the prescribed AI usage quantification guidelines, the approximate AI contribution to the project is **22%** (15.55% direct component involvement + 6.45% itemized cross-cutting debugging/review, per Sections 2 and 2.1).
>
> **AI Tool Used:** ChatGPT
> **Approximate AI Contribution:** **22%**

---
