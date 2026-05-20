import { supabase } from "../../../../../../../supabase.js";

const tarifButtons = document.querySelectorAll("#tarifs .tarif-btn");

            tarifButtons.forEach((button) => {
                button.addEventListener("click", (event) => {
                    event.preventDefault();

                    tarifButtons.forEach((btn) => btn.classList.remove("is-selected"));
                    button.classList.add("is-selected");
                });
            });