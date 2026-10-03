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

  const tiers = {
    S: [],
    A: [],
    B: []
  };

  data.forEach(function(person) {
    if (tiers[person.tier]) {
      tiers[person.tier].push(person);
    }
  });

  peopleList.innerHTML =
    createTierSection("S", "🔴", tiers.S) +
    createTierSection("A", "🟠", tiers.A) +
    createTierSection("B", "🔵", tiers.B);
}


// 티어 구역 만들기
function createTierSection(tier, emoji, people) {
  let html =
    '<section class="tier-section">' +
      '<h3 class="tier-title tier-title-' + tier + '">' +
        emoji + ' ' + tier + ' TIER' +
      '</h3>';

  if (people.length === 0) {
    html +=
      '<div class="empty-tier">' +
        '아직 사람이 없습니다.' +
      '</div>';
  } else {
    people.forEach(function(person) {
      html +=
        '<div class="person">' +

          '<span class="person-name">' +
            person.name +
          '</span>' +

          '<span class="tier tier-' + person.tier + '">' +
            person.tier +
          '</span>' +

          '<button onclick="toggleEdit(' + person.id + ')">' +
            '수정' +
          '</button>' +

          '<span id="edit-' + person.id + '" class="edit-buttons" style="display:none;">' +

            '<button onclick="changeTier(' + person.id + ', \'up\')">' +
              '▲ 올리기' +
            '</button>' +

            '<button onclick="changeTier(' + person.id + ', \'down\')">' +
              '▼ 내리기' +
            '</button>' +

            '<button onclick="deletePerson(' + person.id + ')">' +
              '삭제' +
            '</button>' +

          '</span>' +

        '</div>';
    });
  }

  html += '</section>';

  return html;
}


// 수정 버튼
function toggleEdit(id) {
  const editButtons = document.getElementById("edit-" + id);

  if (editButtons.style.display === "none") {
    editButtons.style.display = "inline-flex";
  } else {
    editButtons.style.display = "none";
  }
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
    .ilike("name", "%" + name + "%");

  if (error) {
    console.error(error);
    result.innerHTML = "오류가 발생했습니다.";
    return;
  }

  if (data.length === 0) {
    result.innerHTML =
      '<div class="no-result">검색 결과가 없습니다.</div>';
    return;
  }

  result.innerHTML = data.map(function(person) {
    return (
      '<div class="person search-person">' +

        '<span class="person-name">' +
          person.name +
        '</span>' +

        '<span class="tier tier-' + person.tier + '">' +
          person.tier +
        '</span>' +

      '</div>'
    );
  }).join("");
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


// 티어 변경
async function changeTier(id, direction) {
  const { data, error } = await supabaseClient
    .from("people")
    .select("tier")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    alert("티어 정보를 가져오지 못했습니다.");
    return;
  }

  const tiers = ["S", "A", "B"];
  const currentIndex = tiers.indexOf(data.tier);

  let newIndex;

  if (direction === "up") {
    newIndex = currentIndex - 1;
  } else {
    newIndex = currentIndex + 1;
  }

  if (newIndex < 0 || newIndex >= tiers.length) {
    return;
  }

  const newTier = tiers[newIndex];

  const { error: updateError } = await supabaseClient
    .from("people")
    .update({
      tier: newTier
    })
    .eq("id", id);

  if (updateError) {
    console.error(updateError);
    alert("티어 변경에 실패했습니다.");
    return;
  }

  loadPeople();
}


// 사람 삭제
async function deletePerson(id) {
  const confirmed = confirm("정말 이 사람을 삭제하시겠습니까?");

  if (!confirmed) {
    return;
  }

  const { error } = await supabaseClient
    .from("people")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    alert("삭제에 실패했습니다.");
    return;
  }

  alert("삭제되었습니다.");

  loadPeople();
}


// 페이지가 열리면 전체 목록 표시
loadPeople();
