```javascript
const SUPABASE_URL = "https://jayxdveislretdubyjjx.supabase.co";
const SUPABASE_KEY = "sb_publishable_KHKp-V6XfNPc-Vvv43ALmA_0KsbGquF";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


// 전체 사람 목록 가져오기
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
    peopleList.innerHTML += `
      <div class="person">
        <span>${person.name}</span>
        <span class="tier tier-${person.tier}">
          ${person.tier}
        </span>
      </div>
    `;
  });
}


// 사람 검색
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
    .ilike("name", `%${name}%`);

  if (error) {
    console.error(error);
    result.innerHTML = "오류가 발생했습니다.";
    return;
  }

  if (data.length === 0) {
    result.innerHTML = `
      <div class="no-result">
        없음
      </div>
    `;
    return;
  }

  result.innerHTML = data.map(person => `
    <div class="person">
      <span>${person.name}</span>
      <span class="tier tier-${person.tier}">
        ${person.tier}
      </span>
    </div>
  `).join("");
}


// 사람 추가
async function addPerson() {
  const nameInput = document.getElementById("nameInput");
  const tierInput = document.getElementById("tierInput");

  const name = nameInput.value.trim();
  const tier = tierInput.value;

  if (!name) {
    alert("사람 이름을 입력해주세요.");
    return;
  }

  const { error } = await supabaseClient
    .from("people")
    .insert([
      {
        name: name,
        tier: tier
      }
    ]);

  if (error) {
    console.error(error);
    alert("추가에 실패했습니다.");
    return;
  }

  alert("사람이 추가되었습니다.");

  nameInput.value = "";

  loadPeople();
}


// 페이지가 열리면 전체 목록 표시
loadPeople();
```
