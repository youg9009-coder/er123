</> JavaScript

const SUPABASE_URL = "https://jayxdveislretdubyjjx.supabase.co";
const SUPABASE_KEY = "sb_publishable_KHKp-V6XfNPc-Vvv43ALmA_0KsbGquF";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

//전체 사람 목록 가져오기
async function loadPeople() {
  const { data, error } = await supabaseClient
  .from("people")
  .select("*")
  .order("id", { ascending: true });

if (error) {
  console.error(error);
  return;
}

const peopleList = document.getElementById("peopleList");

peopleList.innerHTML = "";

data.forEach(person => {
  peopleList.innerHTML +=
    <div class="person">
      <span>${person.name}</span>
      <span class="tier tier-${person.tier}">
             ${person.tier}
    </span>
  </div>
    `;
  });
}

//사람 검색
async function searchPerson() {
  const searchInput = document.getElementById("searchInput");
  const result = document.getElementById("result");

  const name = searchInput.value.trim();

  if (!name) {
    result.innerHTML = "";
    return;
  }

  const { data, error } = await supabaseClient
    .from("people")
    .select("*")
    .ilike("name",`%${name}%`);

  if (error) {
    console.error(error);
    result.innerHTML = "없음";
    return;
  }

  if (data.length === 0) {
    result.innerHTML = `
      <div class="no-result">
        없음
      </div)
    `;
    return;
  }

  result.innerHTM = data.map(person => `
    <div class="person">
      <span>${person.name}</span>
      <span class="tier tier-${person.tier}">
        ${person.tier}
      </span>
    </div>
  `).join("");
}

// 페이지가 열리면 전체 목록 표시
loadPeople();
