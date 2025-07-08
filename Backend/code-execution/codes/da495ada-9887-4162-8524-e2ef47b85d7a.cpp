#include <iostream>
using namespace std;

// Definition for singly-linked list node
struct ListNode {
    int val;
    ListNode* next;
    ListNode(int x) : val(x), next(nullptr) {}
};

// Function to create linked list from input
ListNode* createList(int n) {
    int x;
    cin >> x;
    ListNode* head = new ListNode(x);
    ListNode* tail = head;

    for (int i = 1; i < n; ++i) {
        cin >> x;
        tail->next = new ListNode(x);
        tail = tail->next;
    }

    return head;
}

// Function to add two linked lists
ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {
    ListNode* dummy = new ListNode(0);
    ListNode* current = dummy;
    int carry = 0;

    while (l1 || l2 || carry) {
        int sum = carry;

        if (l1) {
            sum += l1->val;
            l1 = l1->next;
        }

        if (l2) {
            sum += l2->val;
            l2 = l2->next;
        }

        carry = sum / 10;
        current->next = new ListNode(sum % 10);
        current = current->next;
    }

    return dummy->next;
}

// Function to print linked list
void printList(ListNode* head) {
    while (head) {
        cout << head->val;
        if (head->next) cout << " ";
        head = head->next;
    }
    cout << endl;
}

int main() {
    int m, n;
    cin >> m;
    ListNode* l1 = createList(m);

    cin >> n;
    ListNode* l2 = createList(n);

    ListNode* result = addTwoNumbers(l1, l2);

    printList(result);

    return 0;
}
