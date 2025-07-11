const wa_number = window.localStorage.getItem("wa_number");
const socket = io("/", {
    withCredentials: true
});

socket.on("connect", () => {
    socket.emit("join");
    socket.emit("reset-call-event", wa_number);

    socket.on("incoming-call", ({ from, to, as_name }) => {
        const fromName = as_name || from;
        const innerHTML = call_title.innerHTML;

        call_title.innerHTML = innerHTML + fromName;
        wrap_popup_call.style.display = "flex";

        reject_call.addEventListener("click", e => {
            socket.emit("reject-call", { from, to, as_name });
            wrap_popup_call.style.display = "none";
            call_title.innerHTML = innerHTML;
        });

        accept_call.addEventListener("click", e => {
            e.preventDefault();
            wrap_popup_call.style.display = "none";
            call_title.innerHTML = innerHTML;

            socket.emit("accept-call", { from, to, as_name });
            window.location.href = "/panggilan/" + from + "?as=receiver";
        });
    });

    socket.on("reject-call", () => {
        const innerHTML = call_title.innerHTML;
        wrap_popup_call.style.display = "none";
        call_title.innerHTML = innerHTML;
    });
});

let currentSave = null;
let tempContactList = null;
let contactList = null;

function renderListContact() {
    if (contactList) {
        let list_contacts = "";
        if (contactList.length > 0) {
            contactList.forEach(
                e =>
                    (list_contacts += `<div class="contact_card">
                <div class="info_contact_wrap">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="3"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="lucide lucide-user-icon lucide-user"
                    >
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                    <div class="info_contact">
                        <p class="contact_name">${e.as_name}</p>
                        <p class="contact_number">${e.save}</p>
                    </div>
                </div>
                <div class="action_contact">
                    <button class="call_contact" onClick="startCall('${e.save}')">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            class="lucide lucide-video-icon lucide-video"
                        >
                            <path
                                d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"
                            />
                            <rect
                                x="2"
                                y="6"
                                width="14"
                                height="12"
                                rx="2"
                            /></svg
                        >Panggil</button
                    ><button class="del_contact" onclick="toggleConfirmator('${e.save}')">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            class="lucide lucide-trash-icon lucide-trash"
                        >
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg
                        >Hapus
                    </button>
                </div>
            </div>`)
            );
            home_page.innerHTML = list_contacts;
        } else {
            home_page.innerHTML =
                '<h1 id="contacts_not_found">Kontak Tidak ditemukan</h1>';
        }
    }
}

window.addEventListener("load", async e => {
    const response = await fetch("/api/contacts", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });
    if (response.ok) {
        const contacts = await response.json();
        contacts_loading.style.display = "none";
        if (contacts.contacts.length === 0) {
            contacts_empty.style.display = "flex";
        } else {
            tempContactList = contacts.contacts;
            contactList = tempContactList;

            renderListContact();
        }
    }
});

const toggleForm = e => {
    e.preventDefault();
    wrap_form_add_contact.classList.toggle("is_hidden");
};

add_contact_btn.addEventListener("click", toggleForm);
close_add_contact.addEventListener("click", toggleForm);

form_add_contact.addEventListener("submit", async e => {
    e.preventDefault();
    const save = wa_number_add.value;
    const as_name = name_add.value;
    if (!save || !as_name) return;

    loading_add_contact.style.display = "flex";
    submit_add_contact.style.display = "none";
    add_contact_error.style.display = "none";

    const response = await fetch("/api/addcontact", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            save,
            as_name
        })
    });

    loading_add_contact.style.display = "none";
    submit_add_contact.style.display = "flex";

    if (response.ok) {
        wrap_form_add_contact.classList.toggle("is_hidden");
        window.location.reload();
    } else {
        add_contact_error.innerText =
            "Kontak sudah ditambahkan atau kontak tidak terdaftar di sistem atau server error";
        add_contact_error.style.display = "flex";
    }
});

const toggleConfirmator = (...args) => {
    if (typeof args[0] === "string") {
        currentSave = args[0];
    } else {
        currentSave = null;
    }
    wrap_pop_up_confirm_del_contact.classList.toggle("is_hidden");
};

const startCall = (...args) => {
    if (typeof args[0] === "string") {
        window.location.href = "/panggilan/" + args[0] + "?as=caller";
    }
};

close_del_contact.addEventListener("click", toggleConfirmator);

submit_del_contact.addEventListener("click", async e => {
    e.preventDefault();
    if (!currentSave) return;

    loading_del_contact.style.display = "flex";
    submit_del_contact.style.display = "none";
    del_contact_error.style.display = "none";

    const response = await fetch("/api/deletecontact", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            save: currentSave
        })
    });

    loading_del_contact.style.display = "none";
    submit_del_contact.style.display = "flex";

    if (response.ok) {
        wrap_pop_up_confirm_del_contact.classList.toggle("is_hidden");
        window.location.reload();
    } else {
        del_contact_error.innerText = "Gagal menghapus kontak";
        del_contact_error.style.display = "flex";
    }
});

input_search.addEventListener("input", e => {
    if (tempContactList) {
        if (input_search.value === "" || contactList.length === 0) {
            contactList = tempContactList;
        } else {
            contactList = tempContactList.filter(i =>
                i.as_name
                    .toLowerCase()
                    .includes(input_search.value.toLowerCase())
            );
        }
        renderListContact();
    }
});
